import post from "virtual:post";

post({
  title: "Making an image viewer",
  date_modified: new Date("2025-09-30"),
  date_published: new Date("2025-09-08"),
  status: "draft",
  cut: (
    <p>
      Disecting image viewer powering photo gallery of my website. One annoying
      quirk at a time.
    </p>
  ),
});

export default () => {
  return (
    <>
      <h1>Hello, world!</h1>
      <p>Today we do stupid shit </p>
      <p>Amogus!</p>
    </>
  );
};
