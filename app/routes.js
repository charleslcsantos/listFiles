// app/routes.js
module.exports = function(app, passport) {

	var fs = require('fs');	
	var files = [];
	var titulo = 'Área Restrita';
	var diretorioPadrao = '/home/bob/Imagens/';
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) { 
		res.render('index', {
			title: titulo,
			message: req.flash('loginMessage'),
			usuario: req.flash('usuarioDigitado')
		});
	});

	// // =====================================
	// // LOGIN ===============================
	// // =====================================
	// // show the login form
	// app.get('/login', function(req, res) {

	// 	// render the page and pass in any flash data if it exists
	// 	res.render('index.ejs', { 
	// 		title: titulo,
	// 		message: req.flash('loginMessage'),
	// 		usuario: req.flash('usuarioDigitado')
	// 	});
	// });

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/files', // redirect to the secure profile section
            failureRedirect : '/', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	// app.get('/signup', function(req, res) {
	// 	// render the page and pass in any flash data if it exists
	// 	res.render('signup.ejs', { message: req.flash('signupMessage') });
	// });

	// // process the signup form
	// app.post('/signup', passport.authenticate('local-signup', {
	// 	successRedirect : '/profile', // redirect to the secure profile section
	// 	failureRedirect : '/signup', // redirect back to the signup page if there is an error
	// 	failureFlash : true // allow flash messages
	// }));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/files', isLoggedIn, function(req, res) {
		fs.readdir(diretorioPadrao, function(err, arg) {
			if(!err){ 
				files = [];
				for (var i = 0; i < arg.length; i++) {
					if(fs.statSync(diretorioPadrao + arg[i]).isDirectory()){
						files.splice(0, 0, {
							url: '/files/' + arg[i],
							nome: arg[i],
							tipo: 'folder'
						});
					}

					if(fs.statSync(diretorioPadrao + arg[i]).isFile()){
						files[i] = {
							url: '/download?f=' + arg[i],
							nome: arg[i],
							tipo: 'file'
						};
					}
					
					//EXIBE AS INFORMAÇÕES DO ARQUIVO/PASTA
					//console.log(fs.statSync(diretorioPadrao + files[i]));
					//++++++++++++
				};

				res.render('files.ejs', {
					user : req.user, // get the user out of session and pass to template
					title: titulo + ' - Arquivos',
					files: files,
					diretorio: {
						isSubdiretorio : 'false',
						nome: 'Raíz'
					}
				});
			}else
				throw err;
		});
	});

	app.get('/files/*', isLoggedIn, function(req, res) { 
		var diretorioSelecionado = diretorioPadrao + req.params[0] + '/';

		fs.readdir(diretorioSelecionado, function(err, arg) {
			if(!err){
				files = [];
				for (var i = 0; i < arg.length; i++) {

					if(fs.statSync(diretorioSelecionado + arg[i]).isDirectory()){
						files.splice(0, 0, {
							url: '/files/' + req.params[0] + '/' + arg[i],
							nome: arg[i],
							tipo: 'folder'
						});
					}

					if(fs.statSync(diretorioSelecionado + arg[i]).isFile()){
						console.log(diretorioSelecionado + arg[i]);
						console.log(arg[i]);
						console.log(diretorioSelecionado);
						files[i] = {
							url: '/download?f=' + req.params[0] + '/' + arg[i],
							nome: arg[i],
							tipo: 'file'
						};
					}
					
					//EXIBE AS INFORMAÇÕES DO ARQUIVO/PASTA
					//console.log(fs.statSync(diretorioPadrao + files[i]));
					//++++++++++++
				};

			}else
				throw err;

			res.render('files.ejs', {
				user : req.user, // get the user out of session and pass to template
				title: titulo + ' - Arquivos',
				files: files,
				diretorio: {
					isSubdiretorio : 'true',
					nome: req.params[0]
				}
			});
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/download', function(req, res) {
		var file = '/home/bob/Imagens/' + req.query.f;
		res.download(file);
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
