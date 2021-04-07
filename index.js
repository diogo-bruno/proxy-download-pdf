/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');
var sha1 = require('sha1');
const { DownloaderHelper } = require('node-downloader-helper');
const URL = require('url').URL;

const stringIsAValidUrl = (s) => {
  try {
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
};

const app = express();

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  function responseFile(filePath) {
    var data = fs.readFileSync(filePath);
    res.contentType('application/pdf');
    res.send(data);
  }

  //var url = 'http://tjdocs.tjgo.jus.br/documentos/576882/download';
  var url = decodeURIComponent(req.query.url);

  if (!url || !stringIsAValidUrl(url)) {
    res.json({ error: 'Param URL not found or invalid URL...' });
    res.end();
    return;
  }

  var hashNameFile = sha1(url) + '.pdf';
  var pathFile = os.tmpdir() + path.sep + hashNameFile;

  if (fs.existsSync(pathFile)) {
    responseFile(pathFile);
  } else {
    const download = new DownloaderHelper(url, os.tmpdir(), { fileName: hashNameFile });
    download.on('end', (response) => {
      responseFile(response.filePath);
    });
    download.start();
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
