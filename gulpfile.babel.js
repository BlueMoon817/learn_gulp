import gulp from "gulp";

import gpug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import image from "gulp-image";
import gulp_sass from "gulp-sass";
import node_sass from "node-sass";
import autoprefixer from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";



const sass = gulp_sass(node_sass);

const routes = {
  pug : {
      watch: "src/**/*.pug", // 안쪽 파일까지 건들고 싶다면 src/**/*.pug
      src : "src/*.pug",
      dest : "build"
  },
  img : {
    src : "src/img/*",
    dest: "build/img"
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src:"src/scss/style.scss",
    dest: "build/css"
  },
  js: {
    watch: "src/js/**/*.js",
    src:"src/js/main.js",
    dest: "build/js"
  }
}

const pug = () => 
gulp
.src(routes.pug.src)
.pipe(gpug())
.pipe(gulp.dest(routes.pug.dest));

const clean = () => del(["build"]);
// 처음에 src(보여주고 싶은 폴더)를 찾고 localhost 서버를 연다.
const webserver = () => gulp.src("build").pipe(ws({livereload: true, open: true}));

// 이미지는 저장할 때마다 돌리지 않게 하기 위해 assets, postDev가 아닌 prepare 단계에서 동작하게 한다.
const img = () => 
  gulp
    .src(routes.img.src)
    .pipe(image())
    .pipe(gulp.dest(routes.img.dest));

const styles = () => 
  gulp.src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));


const js = () => 
  gulp
    .src(routes.js.src)
    .pipe(bro({ transform: [babelify.configure({presets: ["@babel/preset-env"]}), ['uglifyify', {global: true}]]}))
    .pipe(gulp.dest(routes.js.dest));

// clean은  build를 준비시키는 기능을 하고
// pug는 파일을 실제로 변경하는 일을 한다. 
// 둘의 기능은 너무 다르기 때문에 분리하는 편이 가독성에 좋다.
const watch = () => {
  gulp.watch(routes.pug.watch, pug);
  // img 도 지켜보게 만들기 => 저장할 때마다 이미지를 다시 다 빌드하기 때문에 오래 걸림
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, js);
}
// clean을 export하지 않았기 때문에, console이나 package.json 에서 사용하지 못한다.
// 그래서 호출이 필요하다
const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js]);

// 동시에 두 가지 task를 실행하기를 원한다면 parallel을 사용한다.
// series는 순서대로 실행
const postDev = gulp.parallel([webserver, watch]);
// export는 package json 에서 쓸 command 만 해주면 된다.
// 만약 clean을 export 하지 않는다면, console이나 package json에서 사용할 수 없다.
export const dev = gulp.series([prepare, assets, postDev]);


// 지켜봐야 할 파일과 컴파일 해야 할 파일로 구분하기.