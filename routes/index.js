var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/save', function (req, res, next) {
  let filename = req.body.filename;
  if (!filename || filename.length == 0) {
    res.end('ERROR: empty filepath!');
    return;
  }
  filename = 'drawings/' + filename;
  if (req.body.text === undefined) {
    console.log('save');
    console.log(filename);
    try {
      fs.access(filename, fs.constants.F_OK, (err) => {
        console.log(err);
        if (!err) {
          res.send({ exists: true });
        }
        else {
          res.send({ exists: false });
        }
      });
    }
    catch (e) {
      console.log(e);
      res.send({ exists: false });
      return;
    }
    return;
  }
  else {
    fs.writeFile(filename, req.body.text);
    res.end('saved to ' + filename);
    return;
  }
});

module.exports = router;
