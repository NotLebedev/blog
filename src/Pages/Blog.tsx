import {
  Component,
  createResource,
  For,
  Match,
  Show,
  Suspense,
  Switch,
} from "solid-js";
import Metas from "../Components/Metas";
import getDB, { PostInfo } from "../Data/Database";
import Card from "../Components/Card";
import style from "./Blog.module.css";
import classList from "../Util/Classes";

const Post: Component<{ post: PostInfo }> = (props) => {
  const date_published = () => props.post.date_published;
  const date_modified = () => props.post.date_modified;

  return (
    <Card {...classList(style.postCard)}>
      <span class={style.header}>
        <div class={style.main}>
          <h2>{props.post.title}</h2>
        </div>
        <div class={style.side}>
          <p>{date_published().toDateString()}</p>
          <Show when={date_modified() > date_published()}>
            <p>Edited: {date_modified().toDateString()}</p>
          </Show>
        </div>
      </span>
      <div class={style.cut}>{props.post.cut}</div>
    </Card>
  );
};

const Blog: Component = () => {
  const [posts] = createResource(async () => (await getDB()).posts);
  return (
    <>
      <Metas title="Blog" />

      <Suspense fallback={<p>Loading ...</p>}>
        <Switch>
          <Match when={posts.error || posts() === undefined}>
            <p>Error loading latest posts.</p>
          </Match>
          <Match when={true}>
            <For each={posts()!}>{(post) => <Post post={post} />}</For>
          </Match>
        </Switch>
      </Suspense>
    </>
  );
};

export default Blog;
