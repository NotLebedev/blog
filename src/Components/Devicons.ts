import { Component, JSX, lazy } from "solid-js";

const icons = import.meta.glob("../Icons/**/*.svg", {
  query: "?component-solid",
});

type IconComponent = Component<JSX.SvgSVGAttributes<SVGSVGElement>>;

function load(name: string, location?: string): IconComponent {
  if (location === undefined) {
    location = "devicon";
  }

  return lazy(() => {
    return icons[`../Icons/${location}/${name}.svg`]() as Promise<{
      default: IconComponent;
    }>;
  });
}

export const Java = load("java");
export const Gradle = load("gradle");
export const Spring = load("spring");
export const Hibernate = load("hibernate");
export const Rust = load("rust");
export const Ts = load("ts");
export const Html = load("html");
export const Css = load("css");
export const React = load("react");
export const SolidJS = load("solidjs");
export const C = load("c");
export const Cxx = load("cxx");
export const Postgresql = load("postgresql");
export const SQLite = load("sqlite");
export const Nixos = load("nixos");
export const RockyLinux = load("rockylinux");
export const Debian = load("debian");
export const Tokio = load("tokio", "tokio");
export const Iced = load("iced", "iced");
export const Docker = load("docker");
export const GithubActions = load("githubactions");
export const Gitlab = load("gitlab");
export const Podman = load("podman");
