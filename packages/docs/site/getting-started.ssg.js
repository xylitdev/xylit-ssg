import Header from "../components/header.ssg.js";

export default html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/svg+xml" href="/xylit.svg" />
      <link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css" />
      <title>Getting Started | Xylit SSG</title>
    </head>

    <body>
      ${Header()}

      <main>
        <h2>Prerequisites</h2>

        <ul>
          <li><strong>Node.js:</strong> v22.0.0 or higher</li>
          <li><strong>Editor:</strong> VS Code is recommended</li>
        </ul>

        <p class="notice">
          Xylit does not have any Plugins for Syntax Highligting and
          IntelliSense right now. As workaround you can install Inline
          <a
            href="https://marketplace.visualstudio.com/items?itemName=pushqrdx.inline-html"
            >HTML</a
          >.
        </p>

        <h2>Using the CLI wizard</h2>

        <pre><code>npm create @xylit/ssg</code></pre>

        <p>Then Follow the prompts!</p>

        <p>
          You can also directly specify the project directory & skip the
          questionaire while using the default settings:
        </p>

        <pre><code>npm create @xylit/ssg my-website -- --yes</code></pre>

        <h2>Manual Setup</h2>

        <p>
          This guide will walk you through the steps to manually install and
          configure a new project. If you prefer not to use the automatic create
          xylit CLI tool, you can set up your project yourself by following the
          guide below.
        </p>

        <ol>
          <li>
            <strong>Create your directory</strong>

            <p>
              Create an empty directory with the name of your project, and then
              navigate into it.
            </p>

            <pre><code>mkdir my-website
cd my-website</code></pre>

            <p>
              Once you are in your new directory, create your project
              <code>package.json</code> file. This is how you will manage your
              project dependencies, including Xylit. If you aren’t familiar with
              this file format, run the following command to create one.
            </p>

            <pre><code>npm init --yes</code></pre>
          </li>

          <li>
            <strong>Install Xylit SSG</strong>

            <p>
              First, install the Xylit project dependencies inside your project.
            </p>

            <pre><code>npm install @xylit/ssg</code></pre>

            <p>
              Xylit Projects are ESM only. You have to add the
              <code>type</code> definition to you <code>package.json</code>:
            </p>

            <pre><code>"type": "module",</code></pre>

            <p>
              Then, add the following scripts to your <code>package.json:</code>
            </p>

            <pre><code>"scripts": {
  "serve": "npx @xylit/ssg serve",
  "build": "npx @xylit/ssg build",
},</code></pre>

            <p>
              You’ll use these scripts later in the guide to start Astro and run
              its different commands.
            </p>
          </li>

          <li>
            <p>
              In your text editor, create a new file in your directory at
              <code>index.ssg.js</code>. This will be your first Xylit page in
              the project.
            </p>

            <p>
              For this guide, copy and paste the following code snippet into
              your new file:
            </p>

            <pre><code>export default html\`
  &lt;html&gt;
    &lt;body&gt;
      &lt;h1&gt;Hello World &lt;/h1&gt;
    &lt;/body&gt;
  &lt;/html&gt;
\`;

style.css\`
  h1 { color: azure; }
\`;</code></pre>
          </li>

          <li>
            <strong>Create <code>xylit.config.js</code></strong>

            <p>
              Xylit is configured using <code>xylit.config.js</code>. This file
              is optional if you do not need to configure Xylit, but you may
              wish to create it now.
            </p>

            <p>
              Create <code>xylit.config.js</code> at the root of your project,
              and copy the code below into it:
            </p>

            <pre><code>export default {};</code></pre>

            <p>
              Read Xylits’
              <a href="#configuration">configuration reference</a> for more
              information.
            </p>
          </li>

          <li>
            You can now start the Xylit DevServer with
            <code>npm run serve</code>.
          </li>
        </ol>

        <h2 id="configuration">Configuration</h2>

        <details>
          <summary>cwd</summary>

          <p>The directory that uses Xylit SSG to watch for file changes.</p>

          <dl>
            <dt>Type</dt>
            <dd><code>string</code></dd>

            <dt>default</dt>
            <dd><code>.</code></dd>
          </dl>
        </details>

        <details>
          <summary>input</summary>

          <p>
            Set the directory that xylit will look for resources and routes. The
            value can be either an absolute file system path or a path relative
            to the project root.
          </p>

          <dl>
            <dt>Type</dt>
            <dd><code>string</code></dd>

            <dt>default</dt>
            <dd><code>./site</code></dd>
          </dl>
        </details>

        <details>
          <summary>output</summary>

          <p>
            Set the directory that xylit build writes your final build to. The
            value can be either an absolute file system path or a path relative
            to the project root.
          </p>

          <dl>
            <dt>Type</dt>
            <dd><code>string</code></dd>

            <dt>default</dt>
            <dd><code>./_site</code></dd>
          </dl>
        </details>

        <details>
          <summary>style</summary>

          <h3>style.cssModules</h3>

          <p>
            Definition of the Postcss Module Plugin option that should be used.
          </p>

          <dl>
            <dt>Type</dt>
            <dd><code>[SassOptions]</code></dd>

            <dt>default</dt>
            <dd>
              <code
                >{ localsConvention: "camelCaseOnly", scopeBehaviour: "local"
                }</code
              >
            </dd>
          </dl>

          <h3>style.sass</h3>

          <p>
            Definition of the sass option that should be used. The given options
            will be merged with the defaults.
          </p>

          <dl>
            <dt>Type</dt>
            <dd><code>[SassOptions]</code></dd>

            <dt>default</dt>
            <dd><code>{ loadPaths: [cwd, "node_modules"] }</code></dd>
          </dl>

          <h3>style.plugins</h3>

          <p>Inject PostCSS plugins, you want to use.</p>

          <dl>
            <dt>Type</dt>
            <dd><code>[PostCSSPlugin]</code></dd>

            <dt>default</dt>
            <dd><code>[]</code></dd>
          </dl>
        </details>

        <details>
          <summary>server</summary>

          <h3>server.port</h3>

          <p>Set which port the server should listen on.</p>

          <dl>
            <dt>Type</dt>
            <dd><code>number</code></dd>

            <dt>default</dt>
            <dd><code>8080</code></dd>
          </dl>

          <h3>server.host</h3>

          <p>
            Set which network IP addresses the server should listen on (i.e.
            non-localhost IPs).
          </p>

          <dl>
            <dt>Type</dt>
            <dd><code>string</code></dd>

            <dt>default</dt>
            <dd><code>localhost</code></dd>
          </dl>

          <h3>server.root</h3>

          <p>
            Set the fallback folder that will be used when the resource couldn't
            be found in the input folder.
          </p>

          <dl>
            <dt>Type</dt>
            <dd><code>string</code></dd>

            <dt>default</dt>
            <dd><code>./public</code></dd>
          </dl>
        </details>
      </main>
    </body>
  </html>
`;
