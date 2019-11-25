import gulp from "gulp";
import gpug from "gulp-pug";
import ghtmlmin from "gulp-htmlmin";
import ghtmltaginclude from "gulp-html-tag-include";
import del from "del";
import ws from "gulp-webserver";
import image from "gulp-image";
import autop from "gulp-autoprefixer";
import csso from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages-with-updated-gift";

import sass from "gulp-sass";
sass.compiler = require("node-sass");

const routes = {
  pug: {
    watch: "src/**/*.pug",
    src: "src/*.pug",
    dest: "build/"
  },
  html: {
    watch: "src/**/*.html",
    src: "src/*.html",
    dest: "build/"
  },
  img: {
    src: "src/img/*",
    dest: "build/img"
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css"
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js"
  }
};

const pug = () =>
  gulp
    .src(routes.pug.src)
    .pipe(gpug())
    .pipe(gulp.dest(routes.pug.dest));

const html = () =>
  gulp
    .src(routes.html.src)
    .pipe(ghtmltaginclude())
    .pipe(ghtmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(routes.html.dest));

const clean = () => del(["build/", ".publish"]);

const webserver = () =>
  gulp.src("build/").pipe(ws({ livereload: true, open: true }));

const img = () =>
  gulp
    .src(routes.img.src)
    .pipe(image())
    .pipe(gulp.dest(routes.img.dest));

const style = () =>
  gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autop({
        overrideBrowserslist: ["last 2 versions"]
      })
    )
    .pipe(
      csso({
        restructure: false,
        sourceMap: true,
        debug: true
      })
    )
    .pipe(gulp.dest(routes.scss.dest));

const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }]
        ]
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const gh = () => gulp.src("build/**/*").pipe(ghPages());

const watch = () => {
  //gulp.watch(routes.pug.watch, pug);
  gulp.watch(routes.html.watch, html);
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.scss.watch, style);
  gulp.watch(routes.js.watch, js);
};

const prepare = gulp.series([clean, img]);
// const assets = gulp.series([pug, style, js]);
const assets = gulp.series([html, style, js]);
const live = gulp.parallel([webserver, watch]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([build, gh, clean]);
