import { Controller, Get, Header } from "@nestjs/common";

@Controller("graphiql")
export class GraphiqlController {
  @Get()
  @Header("content-type", "text/html")
  getGraphiql() {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Showcase GraphiQL</title>
    <link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
    <style>
      html, body, #graphiql { height: 100%; margin: 0; }
    </style>
  </head>
  <body>
    <div id="graphiql">Loading GraphiQL...</div>
    <script crossorigin src="https://unpkg.com/react/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/graphiql/graphiql.min.js"></script>
    <script>
      const fetcher = GraphiQL.createFetcher({ url: "/graphql" });
      ReactDOM.createRoot(document.getElementById("graphiql")).render(
        React.createElement(GraphiQL, {
          fetcher,
          defaultEditorToolsVisibility: true,
          defaultQuery: "{\\n  products {\\n    id\\n    slug\\n    name\\n    category\\n    price\\n  }\\n}\\n"
        })
      );
    </script>
  </body>
</html>`;
  }
}
