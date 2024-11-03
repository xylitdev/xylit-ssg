import Header from "./header.ssg.js";
import Sidebar from "./sidebar.ssg.js";

export default ({ title }, slot, { lang }) => html`
  <!DOCTYPE html>
  <!--
	Editorial by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
-->
  <html ${{ lang }}>
    <head>
      <title>${title && `${title} - `}Editorial by HTML5 UP</title>
      <meta charset="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, user-scalable=no"
      />
      <link rel="stylesheet" href="styles/main.scss" />
    </head>
    <body class="is-preload">
      <!-- Wrapper -->
      <div id="wrapper">
        <!-- Main -->
        <div id="main">
          <div class="inner">${Header()} ${slot()}</div>
        </div>

        ${Sidebar()}
      </div>

      <!-- Scripts -->
      <script src="js/jquery.min.js"></script>
      <script src="js/browser.min.js"></script>
      <script src="js/breakpoints.min.js"></script>
      <script src="js/util.js"></script>
      <script src="js/main.js"></script>
    </body>
  </html>
`;
