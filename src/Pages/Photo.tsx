import {
  Component,
  For,
  Suspense,
  Switch,
  createResource,
  Match,
  createSignal,
  onMount,
  onCleanup,
  createEffect,
  createMemo,
} from "solid-js";
import getDB, { Database, getPreviewURL, ImageInfo } from "../Data/Database";
import style from "./Photo.module.css";
import { ArrowUpRight, CheckCircle } from "phosphor-solid-js";
import Metas from "../Components/Metas";
import { Filters, Fuzzy, Tags } from "../Data/Filters";
import { useLocation, useSearchParams } from "@solidjs/router";
import Loading from "../Components/Loading";
import debounce from "../Util/Debounce";
import Arrays from "../Util/Arrays";
import UniqueEventListener from "../Util/UniqueEventListener";

type DisplayableImage = {
  info: ImageInfo;
  type: "DisplayableImage";
};

type AlignmentPlaceholder = {
  width: number;
  type: "AlignmentPlaceholder";
};

type ImageHandle = DisplayableImage | AlignmentPlaceholder;
type ScreenSize = { height: number; width: number };

function fitImages(
  images: ImageInfo[],
  screenSize: ScreenSize,
): ImageHandle[][] {
  const result: ImageHandle[][] = [];
  const targetHeight = Math.min(screenSize.height / 2, 512);
  const resizeFactor = targetHeight / 512;

  let row: ImageHandle[] = [];
  let curWidth = 0;
  for (const image of images) {
    const width = image.previewWidth * resizeFactor;
    curWidth += width;
    row.push({
      info: image,
      type: "DisplayableImage",
    });

    if (curWidth >= window.innerWidth) {
      result.push(row);
      row = [];
      curWidth = 0;
    }
  }

  if (row.length > 0) {
    // If last row has free space add an svg placeholder taking up
    // the rest of space
    row.push({
      width: screenSize.width - curWidth,
      type: "AlignmentPlaceholder",
    });
    result.push(row);
  }

  return result;
}

const GridImage: Component<{
  info: ImageInfo;
}> = (props) => {
  const location = useLocation();

  const [showLoading, setShowLoading] = createSignal(false);

  // Display spinner after slight delay to prevent it blinking
  // even when image is already loaded
  const displayLoading = debounce(() => setShowLoading(true), 100);
  onMount(() => displayLoading());

  let imageRef!: HTMLImageElement;

  return (
    <a
      class={style.gridItem}
      href={`/photo/${props.info.id}${location.search}`}
    >
      <div
        classList={{ [style.loading]: true, [style.hidden]: !showLoading() }}
      >
        <Loading />
      </div>
      <img
        width={props.info.previewWidth}
        height={512}
        src={getPreviewURL(props.info)}
        ref={imageRef}
        class={style.hidden}
        onLoad={() => {
          setShowLoading(false);
          displayLoading.cancel();
          imageRef.className = "";
        }}
      />
      <div class={style.overlay}>
        <p>{props.info.name}</p>
        <ArrowUpRight size={"1.5rem"} />
      </div>
    </a>
  );
};

const GridPlaceholder: Component<{ width: number }> = (props) => {
  return (
    <div class={style.gridItem}>
      <svg width={props.width} height={512} />
    </div>
  );
};

const SearchBar: Component<{
  images: ImageInfo[];
  displayResults: (result: ImageInfo[]) => void;
}> = (props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const fuzzy = new Fuzzy<ImageInfo>(
    (image) =>
      image.name +
      " " +
      image.description +
      " " +
      image.tags.reduce((prev, curr) => prev + " " + curr, ""),
  );
  const tags = new Tags<ImageInfo>((image) => image.tags);
  const search = createMemo(() => new Filters(props.images, fuzzy, tags));

  createEffect<ImageInfo[] | undefined>((prevResult) => {
    fuzzy.query(searchParams.search ?? "");
    tags.query(searchParams.tags?.split(",") ?? []);

    const result = search().filter();

    // Prevent calling displayResults if results did not actually change
    // This avoids infinite recursion when result is empty
    // and fixes issues with rerendering when result did not actually
    // change but
    if (prevResult === undefined || !Arrays.equal(prevResult, result)) {
      props.displayResults(result);
    }

    return result;
  }, undefined);

  function addTag(tag: string) {
    const currentTags = new Set(searchParams.tags?.split(",") ?? []);
    currentTags.add(tag);
    setSearchParams({ tags: [...currentTags].join(",") });
  }

  function removeTag(tag: string) {
    const currentTags = new Set(searchParams.tags?.split(",") ?? []);
    currentTags.delete(tag);
    setSearchParams({ tags: [...currentTags].join(",") });
  }

  function hasTag(tag: string): boolean {
    return searchParams.tags?.split(",")?.includes(tag) ?? false;
  }

  return (
    <span class={style.searchBox}>
      <input
        type="text"
        class={style.searchInput}
        placeholder="Search..."
        value={searchParams.search ?? ""}
        onInput={(event) => setSearchParams({ search: event.target.value })}
      />
      <ul class={style.tagsList}>
        <For each={[...new Set(props.images.flatMap((image) => image.tags))]}>
          {(tag) => (
            <li class={style.tagInList}>
              <input
                id={`inputTag${tag}`}
                type="checkbox"
                checked={hasTag(tag)}
                onChange={(event) =>
                  event.target.checked ? addTag(tag) : removeTag(tag)
                }
              />
              <label for={`inputTag${tag}`}>
                {tag}
                <CheckCircle />
              </label>
            </li>
          )}
        </For>
      </ul>
    </span>
  );
};

const PhotoList: Component<{ db: Database }> = (props) => {
  let grid!: HTMLDivElement;

  const [rect, setRect] = createSignal<ScreenSize>({
    height: window.innerHeight,
    width: window.innerWidth,
  });
  const [displayedImages, setDisplayedImages] = createSignal<ImageInfo[]>([]);
  const [gridHidden, setGridHidden] = createSignal(false);

  let onResizeTransitionEnd!: UniqueEventListener<
    HTMLDivElement,
    "transitionend"
  >;

  let setUpImageTransitionEnd!: UniqueEventListener<
    HTMLDivElement,
    "transitionend"
  >;

  function onResize(): void {
    if (displayedImages().length === 0) {
      return;
    }

    onResizeTransitionEnd.setListener(() => {
      setRect({ height: window.innerHeight, width: window.innerWidth });
      setGridHidden(false);

      onResizeTransitionEnd.removeListener();
    });

    setGridHidden(true);
  }

  onMount(() => {
    window.addEventListener("resize", onResize);
    onResizeTransitionEnd = new UniqueEventListener(grid, "transitionend");
    setUpImageTransitionEnd = new UniqueEventListener(grid, "transitionend");
  });

  onCleanup(() => {
    window.removeEventListener("resize", onResize);
    onResizeTransitionEnd.removeListener();
    setUpImageTransitionEnd.removeListener();
  });

  function setUpImageChnage(newImages: ImageInfo[]): void {
    if (displayedImages().length === 0) {
      setDisplayedImages(newImages);
      return;
    }

    setUpImageTransitionEnd.setListener((ev: TransitionEvent) => {
      // For some reason addEventListener type does not know that ev.target
      // is HTMLElement (but onTransitionEnd JSX attribute does?)
      const tagName = (ev.target as HTMLElement).tagName.toLowerCase();
      if (tagName !== "a") {
        // Only events from grid unloading are expected
        return;
      }

      setDisplayedImages(newImages);

      setGridHidden(false);
      setUpImageTransitionEnd.removeListener();
    });

    setGridHidden(true);
  }

  return (
    <>
      <SearchBar images={props.db.images} displayResults={setUpImageChnage} />
      <div
        classList={{ [style.grid]: true, [style.hidden]: gridHidden() }}
        ref={grid}
      >
        <For each={fitImages(displayedImages(), rect())}>
          {(item) => (
            <div class={style.gridRow}>
              <For each={item}>
                {(item) => (
                  <Switch>
                    <Match when={item.type == "DisplayableImage"}>
                      <GridImage info={(item as DisplayableImage).info} />
                    </Match>
                    <Match when={item.type == "AlignmentPlaceholder"}>
                      <GridPlaceholder
                        width={(item as AlignmentPlaceholder).width}
                      />
                    </Match>
                  </Switch>
                )}
              </For>
            </div>
          )}
        </For>
      </div>
    </>
  );
};

const Photo: Component = () => {
  const [db] = createResource(getDB);
  return (
    <>
      <Metas title="Photos" />
      <Suspense fallback={<p>Loading ...</p>}>
        <Switch>
          <Match when={db.error || db() === undefined}>
            <p>Error loading images.</p>
          </Match>
          <Match when={true}>
            <PhotoList db={db()!} />
          </Match>
        </Switch>
      </Suspense>
    </>
  );
};

export default Photo;
