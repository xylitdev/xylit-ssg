const links = [
  { label: "Home", href: "/" },
  { label: "Getting Started", href: "/getting-started" },
  { label: "GitHub", href: "https://github.com/xylitdev/xylit-ssg" },
];

export default (params, slots, { url }) => html`
  <header>
    <nav>
      ${links.map(
        ({ label, href }) =>
          html`<a ${{ href }} class=${{ current: url.pathname === href }}
            >${label}</a
          >`,
      )}
    </nav>

    <img style="padding-top: 16px" src="/xylit.svg" alt="Xylit Logo" />
    <h1>Xylit SSG</h1>

    <p>…The Less Bloated &amp; More Straightforward Static Site Generator.</p>
  </header>
`;
