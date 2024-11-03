export default ({ alt }, slot) => html`
  <div class="box ${{ alt }}">${slot}</div>
`;

style.scoped.scss`
 @use "sass:color";
  @use "sass:math";

  @import "utils.scss";

  .box {
    border-radius: _size(border-radius);
    border: solid 1px _palette(border);
    margin-bottom: _size(element-margin);
    padding: 1.5em;

    > :last-child,
    > :last-child > :last-child,
    > :last-child > :last-child > :last-child {
      margin-bottom: 0;
    }

    &.alt {
      border: 0;
      border-radius: 0;
      padding: 0;
    }
  }
`;
