export default html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/xylit.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Xylit Static Website</title>
    </head>
    <body>
      <main>
        <a href="https://xylit.dev" target="_blank">
          <img src="/xylit.svg" class="logo" alt="Xylit logo" />
        </a>

        <h1>Hello Xylit SSG!</h1>

        <p class="read-the-docs">Click on the Xylit logo to learn more</p>
      </main>
    </body>
  </html>
`;

style.css`
  :root {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;

    color-scheme: light dark;
    color: rgba(255, 255, 255, 0.87);
    background-color: #242424;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    display: flex;
    place-items: center;
    min-width: 320px;
    min-height: 100vh;
  }

  main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem 0 6rem;
    text-align: center;
  }

  h1 {
    font-size: 3.2em;
    line-height: 1.1;
  }

  .logo {
    height: 10em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;

    &:hover {
      filter: drop-shadow(0 0 2em #646cffaa);
    }
  }

  .read-the-docs {
    color: #888;
  }

  @media (prefers-color-scheme: light) {
    :root {
      color: #213547;
      background-color: #ffffff;
    }
  }
`;
