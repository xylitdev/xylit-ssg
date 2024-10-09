export default html`
  <header id="header">
    <a href="/" class="logo"><strong>Editorial</strong> by HTML5 UP</a>
    <ul class="icons">
      <li>
        <a href="#" class="icon brands fa-twitter">
          <span class="label">Twitter</span>
        </a>
      </li>

      <li>
        <a href="#" class="icon brands fa-facebook-f">
          <span class="label">Facebook</span>
        </a>
      </li>

      <li>
        <a href="#" class="icon brands fa-snapchat-ghost">
          <span class="label">Snapchat</span>
        </a>
      </li>

      <li>
        <a href="#" class="icon brands fa-instagram">
          <span class="label">Instagram</span>
        </a>
      </li>

      <li>
        <a href="#" class="icon brands fa-medium-m">
          <span class="label">Medium</span>
        </a>
      </li>
    </ul>
  </header>
`;

style.scoped.scss`
  @use "sass:math";

  @import "utils.scss";
 

  /* Header */

  #header {
    @include vendor("display", "flex");
    border-bottom: solid 5px _palette(accent);
    padding: 6em 0 1em 0;
    position: relative;

    > * {
      @include vendor("flex", "1");
      margin-bottom: 0;
    }

    .logo {
      border-bottom: 0;
      color: inherit;
      font-family: _font(family-heading);
      font-size: 1.125em;
    }

    .icons {
      text-align: right;
    }

    @include breakpoint("<=xlarge") {
      padding-top: 5em;
    }

    @include breakpoint("<=small") {
      padding-top: 6.5em;

      .logo {
        font-size: 1.25em;
        margin: 0;
      }

      .icons {
        height: math.div(6.25em, 1.25);
        line-height: math.div(6.25em, 1.25);
        position: absolute;
        right: math.div(-0.625em, 1.25);
        top: 0;
      }
    }
  }
`;
