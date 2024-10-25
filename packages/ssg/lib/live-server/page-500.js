export default ({ liveScript }) => /*html*/ `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Xylit - DevServer</title>
      <script>${liveScript}</script>
    </head>

    <body>
      <h1>500 - Internal Server Error</h1>
    </body>
  </html>
`;
