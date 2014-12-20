/**
 * GCDB
 *
 * @module		:: Utils
 * @description :: Вспомогательные функции
 */
module.exports.user = user = {

	getByID: function (id, db, cb) {

		var query;

		if (db instanceof Function) {
			cb = db;
			db = gcdbconn;
			query = 'SELECT login FROM users WHERE id = ?';
		} else {
			switch (db) {
				case 'gcdb':
					query = 'SELECT login FROM users WHERE id = ?';
					db = gcdbconn;
					break;

				case 'maindb':
					query = 'SELECT name AS login FROM users WHERE id = ?';
					db = maindbconn;
					break;

				default:
					return cb('Wrong DB');
			}
		}

		if (!db) return cb('You\'re not connected to GC MySQL DB');

		db.query(query, [id], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0].login);
			} else {
				cb(null, null);
			}
		});
	},
	getByLogin: function (login, db, cb) {

		var query;

		if (db instanceof Function) {
			cb = db;
			db = gcdbconn;
			query = 'SELECT id FROM users WHERE login = ?';
		} else {
			switch (db) {
				case 'gcdb':
					query = 'SELECT id FROM users WHERE login = ?';
					db = gcdbconn;
					break;

				case 'maindb':
					query = 'SELECT id FROM users WHERE name = ?';
					db = maindbconn;
					break;

				default:
					return cb('Wrong DB');
			}
		}

		if (!db) return cb('You\'re not connected to GC MySQL DB');


		db.query(query, [login], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0].id);
			} else {
				cb(null, null);
			}
		});
	},

	getCapitalizedLogin: function getCapitalizedLogin(login, cb) {
		if (!gcdbconn) return cb('You\'re not connected to GC MySQL DB');

		gcdbconn.query('SELECT login, id FROM users WHERE login = ?', [login], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0].login);
			} else {
				cb(null, null);
			}
		});
	},

	getRegDate: function getRegDate(user, cb) {
		if (typeof user === 'number') {
			gcdbconn.query('SELECT reg_date FROM users WHERE id = ?', [user], function (err, result) {
				if (err) return cb(err);

				if (result.length !== 0) {
					cb(null, result[0].reg_date);
				}
			});
		} else if (typeof user === 'string') {
			gcdbconn.query('SELECT reg_date FROM users WHERE login = ?', [user], function (err, result) {
				if (err) return cb(err);

				cb(null, result[0].reg_date);
			});
		} else {
			cb('Incorrect variable!');
		}
	}
};

module.exports.org = org = {
	getByID: function getByID(id, cb) {
		if (!gcdbconn) return cb('You\'re not connected to GC MySQL DB');

		orgdbconn.query('SELECT * FROM organizations WHERE id = ?', [id], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0]);
			} else {
				cb(null, null);
			}
		});
	},

	getByTag: function getByTag(tag, cb) {
		if (!gcdbconn) return cb('You\'re not connected to GC MySQL DB');

		orgdbconn.query('SELECT * FROM organizations WHERE tag = ?', [tag], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0]);
			} else {
				cb(null, null);
			}
		});
	}
};
