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
  untrack,
} from "solid-js";
import { useLocation, useNavigate, _mergeSearchString } from "@solidjs/router";
import { SetSearchParams } from "@solidjs/router/dist/types";
import { ArrowUpRight, CaretCircleDown, CheckCircle } from "phosphor-solid-js";
import getDB, { Database, ImageInfo } from "../Data/Database";
import style from "./Photo.module.css";
import Metas from "../Components/Metas";
import Arrays from "../Util/Arrays";
import UniqueEventListener from "../Util/UniqueEventListener";
import createDropDown from "../Util/DropDown";
import Card from "../Components/Card";
import classList from "../Util/Classes";
import ImagePreview from "../Components/ImagePreview";
import Tag from "../Components/Tag";

type DisplayableImage = {
  info: ImageInfo;
  type: "DisplayableImage";
};

type AlignmentPlaceholder = {
  width: number;
  type: "AlignmentPlaceholder";
};

type ImageHandle = DisplayableImage | AlignmentPlaceholder;

function fitImages(images: ImageInfo[]): ImageHandle[][] {
  const result: ImageHandle[][] = [];
  const targetHeight = Math.min(window.innerHeight / 2, 512);
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
      width: window.innerWidth - curWidth,
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

  return (
    <ImagePreview
      info={props.info}
      href={`/photo/${props.info.id}${location.search}`}
      {...classList(style.gridItem)}
    >
      {/* Fake element used to center image properly when
    using fragment identifier. scroll-margin-top is calculated from top
    of element and image will appear below center. This element is in
    center of image (and is zero height) so it is centered fine */}
      <div class={style.fragmentIdentifier}>
        <div id={props.info.id} />
      </div>
      <div class={style.overlay}>
        <p>{props.info.name}</p>
      </div>
      <div class={style.linkIndicator}>
        <ArrowUpRight size={"1.5rem"} />
      </div>
    </ImagePreview>
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
  db: Database;
  displayResults: (result: ImageInfo[]) => void;
}> = (props) => {
  const searchParams: {
    search?: string;
    tags?: string | string[];
  } = useLocation().query;
  const navigate = useNavigate();
  const [collapsible, setCollapsible] = createSignal<HTMLUListElement>();
  const [expand, setExpand] = createDropDown(collapsible);

  setExpand(searchParams.tags !== undefined && searchParams.tags !== undefined);

  /**
   * Custom setSearchParams method of `useSearchParams` that
   * strips the fragment identifier (aka hash) from url
   * @see https://github.com/solidjs/solid-router/blob/890c520d511fc7a6f5de0e6a4a34cba283de4c4b/src/routing.ts#L223
   */
  function setSearchParams(params: SetSearchParams) {
    const searchString = untrack(() =>
      _mergeSearchString(location.search, params),
    );
    navigate(searchString, {
      resolve: true,
      scroll: false,
      replace: true,
    });
  }

  createEffect<ImageInfo[] | undefined>((prevResult) => {
    const search = searchParams.search ?? "";
    const tags = Arrays.fromMaybeArray(searchParams.tags);

    const result = props.db.search(search, tags);

    // Prevent calling displayResults if results did not actually change
    // This avoids infinite recursion when result is empty
    // and fixes issues with rerendering when result did not actually
    // change but query did
    if (prevResult === undefined || !Arrays.equal(prevResult, result)) {
      props.displayResults(result);
    }

    return result;
  }, undefined);

  function addTag(tag: string) {
    const currentTags = new Set(Arrays.fromMaybeArray(searchParams.tags));
    currentTags.add(tag);
    setSearchParams({ tags: [...currentTags] });
  }

  function removeTag(tag: string) {
    const currentTags = new Set(Arrays.fromMaybeArray(searchParams.tags));
    currentTags.delete(tag);
    setSearchParams({ tags: [...currentTags] });
  }

  function hasTag(tag: string): boolean {
    return searchParams.tags?.includes(tag) ?? false;
  }

  function adjustOnExpand() {
    const el = collapsible();
    if (el === undefined) {
      return;
    }

    el.style.maxHeight = `${el.scrollHeight}px`;
  }

  return (
    <Card
      {...classList(style.searchBox)}
      narrow={true}
      onClick={() => {
        setExpand(!expand());
      }}
    >
      <span class={style.alwaysShow}>
        <input
          type="text"
          class={style.searchInput}
          placeholder="Search..."
          value={searchParams.search ?? ""}
          onInput={(event) => setSearchParams({ search: event.target.value })}
          onClick={(ev) => {
            setExpand(true);
            ev.stopPropagation();
          }}
        />
        <div {...classList(style.foldButton, { [style.expand]: expand() })}>
          <CaretCircleDown size="1.5rem" />
        </div>
      </span>

      <div class={style.tagsList} ref={setCollapsible}>
        <For
          each={[...new Set(props.db.images.flatMap((image) => image.tags))]}
        >
          {(tag) => (
            <>
              <input
                class={style.tagInput}
                id={`inputTag${tag}`}
                type="checkbox"
                checked={hasTag(tag)}
                onChange={(event) =>
                  event.target.checked ? addTag(tag) : removeTag(tag)
                }
              />
              <label for={`inputTag${tag}`}>
                <Tag {...classList(style.tagInList)}>
                  <span>{tag}</span>
                  <CheckCircle onTransitionEnd={adjustOnExpand} />
                </Tag>
              </label>
            </>
          )}
        </For>
      </div>
    </Card>
  );
};

const PhotoList: Component<{ db: Database }> = (props) => {
  let grid!: HTMLDivElement;

  let displayedImages: ImageInfo[] = [];
  const [gridHidden, setGridHidden] = createSignal(false);
  const [layout, setLayout] = createSignal(fitImages(displayedImages));

  let onResizeTransitionEnd!: UniqueEventListener<
    HTMLDivElement,
    "transitionend"
  >;

  let setUpImageTransitionEnd!: UniqueEventListener<
    HTMLDivElement,
    "transitionend"
  >;

  function layoutsEqual(lhs: ImageHandle[][], rhs: ImageHandle[][]): boolean {
    return Arrays.equal(lhs, rhs, (lhs, rhs) =>
      Arrays.equal(lhs, rhs, (lhs, rhs) => {
        switch (true) {
          case lhs.type === "AlignmentPlaceholder" &&
            rhs.type === "AlignmentPlaceholder":
            return true;
          case lhs.type === "DisplayableImage" &&
            rhs.type === "DisplayableImage":
            return lhs.info === (rhs as DisplayableImage).info;
          default:
            return false;
        }
      }),
    );
  }

  function onResize(): void {
    if (displayedImages.length === 0) {
      return;
    }

    const newLayout = fitImages(displayedImages);

    if (layoutsEqual(layout(), newLayout)) {
      return;
    }

    onResizeTransitionEnd.setListener(() => {
      setLayout(newLayout);
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
    const newLayout = fitImages(newImages);

    if (layoutsEqual(layout(), newLayout)) {
      return;
    }

    if (displayedImages.length === 0) {
      displayedImages = newImages;
      setLayout(newLayout);
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

      displayedImages = newImages;
      setLayout(newLayout);

      setGridHidden(false);
      setUpImageTransitionEnd.removeListener();
    });

    setGridHidden(true);
  }

  return (
    <>
      <SearchBar db={props.db} displayResults={setUpImageChnage} />
      <div
        {...classList(style.grid, { [style.hidden]: gridHidden() })}
        ref={grid}
      >
        <For each={layout()}>
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
