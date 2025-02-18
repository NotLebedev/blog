import { Component, For } from "solid-js";
import Metas from "../Components/Metas";
import styles from "./About.module.css";
import {
  C,
  Css,
  Cxx,
  Debian,
  Docker,
  GithubActions,
  Gitlab,
  Gradle,
  Hibernate,
  Html,
  Iced,
  Java,
  Nixos,
  Podman,
  Postgresql,
  React,
  RockyLinux,
  Rust,
  SolidJS,
  Spring,
  SQLite,
  Tokio,
  Ts,
} from "../Components/Devicons";
import Card from "../Components/Card";

const techIKnow: [Component, string][][] = [
  [
    [Java, "https://www.java.com/"],
    [Gradle, "https://gradle.org/"],
    [Spring, "https://spring.io/"],
  ],
  [
    [Rust, "https://www.rust-lang.org/"],
    [Tokio, "https://tokio.rs/"],
    [Iced, "https://iced.rs/"],
  ],
  [
    [React, "https://react.dev/"],
    [SolidJS, "https://www.solidjs.com/"],
    [Ts, "https://www.typescriptlang.org/"],
    [Html, "https://developer.mozilla.org/en-US/docs/Web/HTML"],
    [Css, "https://developer.mozilla.org/en-US/docs/Web/CSS"],
  ],
  [
    [C, "https://en.cppreference.com/w/c/language"],
    [Cxx, "https://isocpp.org/"],
  ],
  [
    [Postgresql, "https://www.postgresql.org"],
    [SQLite, "https://www.sqlite.org/"],
    [Hibernate, "https://hibernate.org/"],
  ],
  [
    [Docker, "https://www.docker.com/"],
    [Podman, "https://podman.io/"],
    [GithubActions, "https://github.com/features/actions"],
    [Gitlab, "https://docs.gitlab.com/ee/ci/"],
  ],
  [
    [Nixos, "https://nixos.org/"],
    [RockyLinux, "https://rockylinux.org"],
    [Debian, "https://www.debian.org/"],
  ],
];

const About: Component = () => {
  return (
    <>
      <Metas title="About" />
      <h1>About me</h1>
      <p>I'm Artemiy. Ich heiße Artemiy. Меня зовут Артемий.</p>
      <p>
        I'm a young software engineer and secure software development
        specialist. I'm interested in compilers design and static analysis, OS
        development and hardware engineering.
      </p>
      <p>
        I value robust and stable software. That's why I like to use things like
        Rust and Nixos for my personal projects. Even this site is built with
        SolidJS and Typescript to somewhat avoid typical web slop.
      </p>
      <p>Also I'm a novice photographer :)</p>
      <h2>Some of the tech I know:</h2>
      <div class={styles.techList}>
        <For each={techIKnow}>
          {(group) => (
            <Card>
              <For each={group}>
                {(item) => {
                  const Icon = item[0];
                  return (
                    <a href={item[1]} target="_blank" rel="noopener noreferrer">
                      <Icon />
                    </a>
                  );
                }}
              </For>
            </Card>
          )}
        </For>
      </div>
    </>
  );
};

export default About;
