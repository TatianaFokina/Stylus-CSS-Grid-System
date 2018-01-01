// ========================================================================
// Подключение модулей
// ========================================================================
var gulp = require('gulp');
	CompileStylus = require('gulp-stylus');
	pug           = require('gulp-pug');
	fs            = require("fs");
	pugBeautify   = require('gulp-pug-beautify');
	browserSync   = require('browser-sync');
	concat        = require('gulp-concat'); // Конкатенация файлов
	uglify        = require('gulp-uglifyjs'); // Сжатие JS
	cssnano       = require('gulp-cssnano'); // Минификация CSS
	rename        = require('gulp-rename'); // Переименование файлов
	del           = require('del'); // Удаление файлов и папок
	cache         = require('gulp-cache'); // Библиотека кеширования
	autoprefixer  = require('gulp-autoprefixer'); // Автоматическое добавление префиксов
	gulp_postcss = require('gulp-postcss');
	mergeRules = require('postcss-merge-rules'); // Объединяет селекторы с обинаковыми свойствами
	//combineCssMedia = require('css-mqpacker'); // Объединяет @media, помещает их в конец css
	htmlbeautify = require('gulp-html-beautify');
	plumber = require('gulp-plumber');
	notify = require("gulp-notify");
	//modifyCssUrls = require('gulp-modify-css-urls'); // Меняет пути к файлам в css
	//replace = require('gulp-replace');



// ========================================================================
// Компиляция
// ========================================================================

// Stylus (в папку test)
gulp.task('__compileStylus', function () {
	// Перечисляем плагины для postcss
	var $postcss_plugins = [
		mergeRules
	]

	return gulp.src([
		'src/styl/**/*.styl', // Все файлы .styl
		'!src/styl/**/_*.styl' // Исключаем файлы, которые начинаются на "_"
		])
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(CompileStylus({'include css': true}))
		.pipe(autoprefixer({
			browsers: [
				"last 2 versions",
				"> 1%",
				"Firefox >= 20"], // Версии поддерживаемых браузеров
			cascade: false
		}))
		.pipe(gulp_postcss($postcss_plugins))
		.pipe(gulp.dest('test/css'))
		.pipe(browserSync.reload({stream: true}));
});

// Pug
gulp.task('__compilePug', function () {
	return gulp.src([
		'src/pug/**/*.pug'
		])
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(pug())
		//.pipe(pug({pretty: true}))   // Разметка НЕ в одну строку
		.pipe(htmlbeautify({
			"indent_with_tabs": true
		}))
		.pipe(gulp.dest("test"))
		.pipe(browserSync.reload({stream: true}));
});



// ========================================================================
// Объединение файлов
// ========================================================================
// JS
gulp.task('__mergeJS', function() {
	return gulp.src('src/js/**/*.js') // Список подключаемых файлов. Если подключаем один файл, то убрать скобки и запятые
		.pipe(plumber())
		.pipe(concat('all.min.js')) // Собираем их в кучу в новом файле
		.pipe(gulp.dest('test/js')); // Сохраняем в папку
});



// ========================================================================
// Watch (следит за измениями файлов и компилирует в папку test)
// ========================================================================

// Следит за папкой "test"
gulp.task('Watch', ['Build--test'], function () {
	gulp.watch('src/styl/**/*.styl', ['__compileStylus']);
	gulp.watch(['src/**/*.pug'], ['__compilePug']);
});

// Следит за папкой "test" и открывает в браузере
gulp.task('LiveReload', ['Build--test'], function () {
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: 'test' // Директория для сервера
		},
		port: 3087,
		notify: false // Отключаем уведомления
	});
	gulp.watch('src/styl/**/*.styl', ['__compileStylus']);
	gulp.watch('src/**/*.pug', ['__compilePug']);
});



// ========================================================================
// Удаление папок
// ========================================================================

// dist
gulp.task('__delDist', function() {
	return del.sync('dist');
});
// test
gulp.task('__delTest', function() {
	return del.sync('test');
});






// ========================================================================
// Компиляция проекта
// ========================================================================

// →  "test"
gulp.task('Build--test', ['__compileStylus', '__mergeJS', '__compilePug'], function() {
	// Fonts
	gulp.src('src/fonts/**/*')
		.pipe(gulp.dest('test/fonts'));

	// Images
	gulp.src('src/imgs/**/*')
		.pipe(gulp.dest('test/imgs'));
});

// → "dist"
gulp.task('Build--dist', ['__delDist', '__compileStylus', '__compilePug', '__mergeJS'], function() {
	// Fonts
	gulp.src('src/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));

	// Copy html
	gulp.src('test/**/*.html')
		.pipe(gulp.dest("dist"));

	// CSS
	gulp.src('test/css/**/*.css')
		.pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
		// Меняет пути к файлам в css
		//.pipe(replace('\"/fonts', '\"/assets/dist/fonts'))
		//.pipe(replace('\'/fonts', '\'/assets/dist/fonts'))
		.pipe(cssnano()) // Сжимаем
		.pipe(gulp.dest('dist/css')); // Сохраняем в папку

	// Copy .md
	gulp.src('src/*.md')
		.pipe(gulp.dest("dist"));

	// Сжатие JS
	gulp.src('test/js/**/*.js')
		.pipe(plumber())
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('dist/js')); // Сохраняем в папку
});




// Задача по-умолчанию
gulp.task('default', ['LiveReload']);