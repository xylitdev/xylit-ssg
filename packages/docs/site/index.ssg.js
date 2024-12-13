import Header from "../components/header.ssg.js";

export default html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/svg+xml" href="/xylit.svg" />
      <link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css" />
      <title>Xylit SSG - A Powerful Static Site Generator</title>
    </head>

    <body>
      ${Header()}

      <main>
        <p class="notice">
          Xylit SSG is in a very early stage of development. Syntax and API are
          not stable and may change at any time. While the core functionality
          already has been implemented, some features are still missing.
        </p>

        <h2>Why Another Static Site Generator?</h2>

        <p>
          The JavaScript ecosystem already has many different static page
          generators to offer. Each of these generators has its own template
          language. With the release of tagged template literals, there is now a
          possibility to realize templating with native features alone. The
          availability of custom loaders in NodeJS also makes it possible to
          provide a DX-friendly development environment without having to use
          complex build tools.
        </p>

        <h2>Features</h2>

        <details>
          <summary>Expressive Syntax</summary>

          <p>
            Xylit heavily relies on tagged template literals, which makes
            composing differend DSL's a breeze:
          </p>

          <ul>
            <li>No Need for hacky Markdown or YAML injections!</li>
            <li>No need for learning a new Template Language!</li>
          </ul>
        </details>

        <details>
          <summary>Component-Driven Templating</summary>

          <p>Reuse parts of your code in form of components:</p>

          <ul>
            <li>Properties Support</li>
            <li>Named Slot Support</li>
            <li>Scoped Slot Support</li>
          </ul>
        </details>

        <details>
          <summary>Flexible Styling</summary>

          <p>
            A Component-Driven approach requires a powerful styling toolset.
            Xylit's Out of the Box Support:
          </p>

          <ul>
            <li>Properties Support</li>
            <li>Named Slot Support</li>
            <li>Scoped Slot Support</li>
          </ul>
        </details>

        <details>
          <summary>File-Based Routing</summary>

          <p>
            Xylit ships with a file-based routing system. When a Xylit-file is
            added to the project it's automatically available as a route.
          </p>
        </details>

        <details>
          <summary>DevServer & Livereload</summary>

          <p>
            Xylit comes with e built-in DevServer & supports live reloading.
          </p>
        </details>

        <details>
          <summary>Agnostic Project Structure</summary>

          <p>
            Many generators require a specific project structure. However, Xylit
            is able to align with your project structure.
          </p>
        </details>

        <details>
          <summary>Zero JavaSript Builds</summary>

          <p>
            Templates are processed during the build time. Xylit does not
            generate any JavaScript by itself.
          </p>
        </details>
      </main>
    </body>
  </html>
`;
