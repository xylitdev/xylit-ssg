import Shell from "./_components/shell.ssg.js";

const features = [
  { icon: "fa-gem", title: "Portitor ullamcorper" },
  { icon: "fa-paper-plane solid", title: "Sapien veroeros" },
  { icon: "fa-rocket solid", title: "Quam lorem ipsum" },
  { icon: "fa-signal solid", title: "Sed magna finibus" },
];

const posts = [
  {
    name: "Interdum aenean",
    image: { src: "images/pic01.jpg", alt: "" },
  },
  { name: "Nulla amet dolore", image: { src: "images/pic02.jpg", alt: "" } },
  { name: "Tempus ullamcorper", image: { src: "images/pic03.jpg", alt: "" } },
  { name: "Sed etiam facilis", image: { src: "images/pic04.jpg", alt: "" } },
  { name: "Feugiat lorem aenean", image: { src: "images/pic05.jpg", alt: "" } },
  { name: "Amet varius aliquam", image: { src: "images/pic06.jpg", alt: "" } },
];

export default Shell(
  {},
  html`
    <!-- Banner -->
    <section id="banner">
      <div class="content">
        <header>
          <h1>
            Hi, I’m Editorial<br />
            by HTML5 UP
          </h1>
          <p>A free and fully responsive site template</p>
        </header>

        <p>
          Aenean ornare velit lacus, ac varius enim ullamcorper eu. Proin
          aliquam facilisis ante interdum congue. Integer mollis, nisl amet
          convallis, porttitor magna ullamcorper, amet egestas mauris. Ut magna
          finibus nisi nec lacinia. Nam maximus erat id euismod egestas.
          Pellentesque sapien ac quam. Lorem ipsum dolor sit nullam.
        </p>

        <ul class="actions">
          <li><a href="#" class="button big">Learn More</a></li>
        </ul>
      </div>

      <span class="image object">
        <img src="images/pic10.jpg" alt="" />
      </span>
    </section>

    <!-- Section -->
    <section>
      <header class="major">
        <h2>Erat lacinia</h2>
      </header>

      <div class="features">
        ${features.map(
          ({ icon, title }) => html`
            <article>
              <span class="icon ${icon}"></span>
              <div class="content">
                <h3>${title}</h3>
                <p>
                  Aenean ornare velit lacus, ac varius enim lorem ullamcorper
                  dolore. Proin aliquam facilisis ante interdum. Sed nulla amet
                  lorem feugiat tempus aliquam.
                </p>
              </div>
            </article>
          `
        )}
      </div>
    </section>

    <!-- Section -->
    <section>
      <header class="major">
        <h2>Ipsum sed dolor</h2>
      </header>

      <div class="posts">
        ${posts.map(
          ({ name, image }) => html`
            <article>
              <a href="#" class="image">
                <img ${image} />
              </a>

              <h3>${name}</h3>

              <p>
                Aenean ornare velit lacus, ac varius enim lorem ullamcorper
                dolore. Proin aliquam facilisis ante interdum. Sed nulla amet
                lorem feugiat tempus aliquam.
              </p>

              <ul class="actions">
                <li><a href="#" class="button">More</a></li>
              </ul>
            </article>
          `
        )}
      </div>
    </section>
  `
);
