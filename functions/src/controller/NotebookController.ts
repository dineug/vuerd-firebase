import app from "../plugins/express";
import * as firebaseFunctions from "firebase-functions";
import { getNotebooksDocRef } from "../plugins/util";
import { Notebook } from "../service/NotebookModel";
// @ts-ignore
import * as fs from "fs";

const functions = firebaseFunctions.region("us-central1");

app.get("/notebooks/:id/document", async (req, res) => {
  try {
    let [html, doc] = await Promise.all([
      new Promise<string>((resolve, reject) => {
        fs.readFile("./index.html", "utf8", (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      }),
      getNotebooksDocRef(req.params.id).get()
    ]);

    if (doc.exists) {
      res.set("Content-Type", "text/html");

      const notebook = doc.data() as Notebook;

      html = html.replace(
        /<title>(.*?)<\/title>/,
        `<title>${notebook.title}</title>`
      );
      html = html.replace(
        /<meta name=description(.*?)content=https:\/\/vuerd.io\/vuerd.png>/,
        ""
      );

      const meta: string[] = [];
      meta.push(`
        <meta property=og:type content=article />
        <meta property=og:title content="${notebook.title}">
        <meta property=og:url content="https://vuerd.io${req.path}">
      `);
      if (notebook.description.trim() !== "") {
        meta.push(`
          <meta name=description content="${notebook.description}">
          <meta property=og:description content="${notebook.description}">
        `);
      }
      if (notebook.image) {
        meta.push(`<meta property=og:image content="${notebook.image}">`);
      }
      meta.push("</head>");
      html = html.replace(/<\/head>/, meta.join(""));

      res.send(html);
    } else {
      res.redirect("/");
    }
  } catch (e) {
    res.redirect("/");
  }
});

export const documentDetail = functions.https.onRequest(app);
