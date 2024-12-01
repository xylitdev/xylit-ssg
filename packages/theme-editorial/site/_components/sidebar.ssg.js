import Footer from "./footer.ssg.js";
import Menu from "./menu.ssg.js";

export default html`
  <div id="sidebar">
    <div class="inner">
      <!-- Search -->
      <section id="search" class="alt">
        <form method="post" action="#">
          <input type="text" name="query" id="query" placeholder="Search" />
        </form>
      </section>

      ${Menu({
        items: [
          { name: "Homepage", href: "/" },
          { name: "Generic", href: "/generic" },
          { name: "Elements", href: "/elements" },
        ],
      })}

      <!-- Section -->
      <section>
        <header class="major">
          <h2>Ante interdum</h2>
        </header>
        <div class="mini-posts">
          <article>
            <a href="#" class="image"><img src="images/pic07.jpg" alt="" /></a>
            <p>
              Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore
              aliquam.
            </p>
          </article>
          <article>
            <a href="#" class="image"><img src="images/pic08.jpg" alt="" /></a>
            <p>
              Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore
              aliquam.
            </p>
          </article>
          <article>
            <a href="#" class="image"><img src="images/pic09.jpg" alt="" /></a>
            <p>
              Aenean ornare velit lacus, ac varius enim lorem ullamcorper dolore
              aliquam.
            </p>
          </article>
        </div>
        <ul class="actions">
          <li><a href="#" class="button">More</a></li>
        </ul>
      </section>

      <!-- Section -->
      <section>
        <header class="major">
          <h2>Get in touch</h2>
        </header>
        <p>
          Sed varius enim lorem ullamcorper dolore aliquam aenean ornare velit
          lacus, ac varius enim lorem ullamcorper dolore. Proin sed aliquam
          facilisis ante interdum. Sed nulla amet lorem feugiat tempus aliquam.
        </p>
        <ul class="contact">
          <li class="icon solid fa-envelope">
            <a href="#">information@untitled.tld</a>
          </li>
          <li class="icon solid fa-phone">(000) 000-0000</li>
          <li class="icon solid fa-home">
            1234 Somewhere Road #8254<br />
            Nashville, TN 00000-0000
          </li>
        </ul>
      </section>

      ${Footer()}
    </div>
  </div>
`;

style.scss`
  @use "sass:color";
  @use "sass:math";

  @import "utils.scss";

  /* Sidebar */

  #search {
    form {
      @include icon(false, solid);
      position: relative;

      &:before {
        @include vendor("transform", "scaleX(-1)");
        color: _palette(fg);
        content: "\f002";
        cursor: default;
        display: block;
        font-size: 1.5em;
        height: math.div(_size(element-height), 1.375);
        line-height: math.div(_size(element-height), 1.375);
        opacity: 0.325;
        position: absolute;
        right: 0;
        text-align: center;
        top: 0;
        width: math.div(_size(element-height), 1.375);
      }

      input[type="text"] {
        padding-right: _size(element-height);
      }
    }
  }

  #sidebar {
    $pad: math.div(2em, 0.9);

    @include vendor("flex-grow", "0");
    @include vendor("flex-shrink", "0");
    @include vendor(
      "transition",
      ("margin-left 0.5s ease", "box-shadow 0.5s ease")
    );
    background-color: _palette(bg-alt);
    font-size: 0.9em;
    position: relative;
    width: _size(sidebar-width);

    h2 {
      font-size: math.div(1.25em, 0.9);
    }

    > .inner {
      @include padding($pad, $pad, (0, 0, $pad, 0));
      position: relative;
      width: _size(sidebar-width);

      > * {
        border-bottom: solid 2px _palette(border);
        margin: 0 0 (_size(element-margin) * 1.75) 0;
        padding: 0 0 (_size(element-margin) * 1.75) 0;

        > :last-child {
          margin-bottom: 0;
        }

        &:last-child {
          border-bottom: 0;
          margin-bottom: 0;
          padding-bottom: 0;
        }
      }

      > .alt {
        background-color: color.adjust(_palette(bg-alt), $lightness: -2%);
        border-bottom: 0;
        margin: ($pad * -1) 0 ($pad * 2) ($pad * -1);
        padding: $pad;
        width: calc(100% + #{$pad * 2});
      }
    }

    .toggle {
      @include icon(false, solid);
      @include vendor("transition", "left 0.5s ease");
      -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
      border: 0;
      display: block;
      height: 7.5em;
      left: _size(sidebar-width);
      line-height: 7.5em;
      outline: 0;
      overflow: hidden;
      position: absolute;
      text-align: center;
      text-indent: -15em;
      white-space: nowrap;
      top: 0;
      width: 6em;
      z-index: _misc(z-index-base);

      &:before {
        content: "\f0c9";
        font-size: 2rem;
        height: inherit;
        left: 0;
        line-height: inherit;
        position: absolute;
        text-indent: 0;
        top: 0;
        width: inherit;
      }
    }

    &.inactive {
      margin-left: (_size(sidebar-width) * -1);
    }

    @include breakpoint("<=xlarge") {
      $pad: math.div(1.5em, 0.9);

      width: _size(sidebar-width-alt);

      > .inner {
        @include padding($pad, $pad, (0, 0, $pad, 0));
        width: _size(sidebar-width-alt);

        > .alt {
          margin: ($pad * -1) 0 ($pad * 2) ($pad * -1);
          padding: $pad;
          width: calc(100% + #{$pad * 2});
        }
      }

      .toggle {
        height: 6.25em;
        left: _size(sidebar-width-alt);
        line-height: 6.25em;
        text-indent: 5em;
        width: 5em;

        &:before {
          font-size: 1.5rem;
        }
      }

      &.inactive {
        margin-left: (_size(sidebar-width-alt) * -1);
      }
    }

    @include breakpoint("<=large") {
      box-shadow: 0 0 5em 0 rgba(0, 0, 0, 0.175);
      height: 100%;
      left: 0;
      position: fixed;
      top: 0;
      z-index: _misc(z-index-base);

      &.inactive {
        box-shadow: none;
      }

      > .inner {
        -webkit-overflow-scrolling: touch;
        height: 100%;
        left: 0;
        overflow-x: hidden;
        overflow-y: auto;
        position: absolute;
        top: 0;

        &:after {
          content: "";
          display: block;
          height: 4em;
          width: 100%;
        }
      }

      .toggle {
        text-indent: 6em;
        width: 6em;

        &:before {
          font-size: 1.5rem;
          margin-left: math.div(-0.875em, 2);
        }
      }

      body.is-preload & {
        display: none;
      }
    }

    @include breakpoint("<=small") {
      .toggle {
        text-indent: 7.25em;
        width: 7.25em;

        &:before {
          color: _palette(fg);
          margin-left: math.div(-0.125em, 2);
          margin-top: math.div(-0.5em, 2);
          font-size: 1.1rem;
          z-index: 1;
        }

        &:after {
          background: color.adjust(_palette(fg), $alpha: -0.25, $lightness: 35%);
          border-radius: _size(border-radius);
          content: "";
          height: 3.5em;
          left: 1em;
          position: absolute;
          top: 1em;
          width: 5em;
        }
      }
    }
  }
`;