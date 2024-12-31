import { Component, createResource, Switch, Match, Suspense } from "solid-js";
import Metas from "../Components/Metas";
import getDB from "../Data/Database";
import Card from "../Components/Card";
import ImagePreview from "../Components/ImagePreview";
import classList from "../Util/Classes";
import style from "./Home.module.css";
import Md from "../Components/Md";

const LatestPhoto: Component = () => {
  const [info] = createResource(async () => {
    const db = await getDB();

    return db?.images[0];
  });

  return (
    <>
      <h2>Latest</h2>
      <Suspense fallback={<p>Loading ...</p>}>
        <Switch>
          <Match when={info.error || info() === undefined}>
            <p>Error loading latest photo.</p>
          </Match>
          <Match when={true}>
            <a href={`/photo/${info()!.id}`}>
              <Card {...classList(style.latestPhoto)}>
                <ImagePreview
                  href={`/photo/${info()!.id}`}
                  info={info()!}
                  {...classList(style.preview)}
                />
                <div class={style.description}>
                  <h2>{info()!.name}</h2>
                  <Md text={info()!.description ?? ""} />
                </div>
              </Card>
            </a>
          </Match>
        </Switch>
      </Suspense>
    </>
  );
};

const Home: Component = () => {
  return (
    <>
      <Metas />
      <h1>Welcome!</h1>
      <p>
        I'm Artemiy, a geek passionate about computers and software engineering
        in all of it forms, photography and art in general and many other
        things.
      </p>
      <p>
        Posting eveything I see through the lens and think in the form of a blog
        (soon) here.
      </p>
      <LatestPhoto />
    </>
  );
};

export default Home;
