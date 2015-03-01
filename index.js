/**
 * GCDB
 *
 * @module		:: GCDB
 * @description :: Functions for work with GreenCubes databases
 */

var mysql = require('mysql');


var dbconn = {
	sitedb: null,
	usersdb: null,
	marinsrvdb: null,
	orgdb: null,
	apidb: null
};

module.exports = GCDB;

function GCDB(config) {
	if (!config.sitedb) {
		console.error("Wrong configuration: No site [gcdb] DB connection");
	}

	if (!config.usersdb) {
		console.error("Wrong configuration: No users [main] DB connection");
	}

	if (!config.mainsrvdb) {
		console.error("Wrong configuration: No main game server auth DB connection");
	}

	if (!config.orgdb) {
		console.error("Wrong configuration: No organization DB connection");
	}

	if (!config.apidb) {
		console.error("Wrong configuration: No API DB connection");
	}

	this.sitedb = dbconn.sitedb = (config.sitedb) ? mysql.createPool(config.sitedb) : null;
	this.usersdb = dbconn.usersdb = (config.usersdb) ? mysql.createPool(config.usersdb) : null;
	this.mainsrvdb = dbconn.mainsrvdb = (config.mainsrvdb) ? mysql.createPool(config.mainsrvdb) : null;
	this.orgdb = dbconn.orgdb = (config.orgdb) ? mysql.createPool(config.orgdb) : null;
	this.apidb = dbconn.apidb = (config.apidb) ? mysql.createPool(config.apidb) : null;

	this.escape =  mysql.escape;
};

GCDB.prototype.user = user = {
	getByID: function (id, db, cb) {

		var query;

		if (db instanceof Function) {
			cb = db;
			db = dbconn.sitedb;
			query = 'SELECT login FROM users WHERE id = ?';
		} else {
			switch (db) {
				case 'gcdb':
				case 'sitedb':
					query = 'SELECT login FROM users WHERE id = ?';
					db = dbconn.sitedb;
					break;

				case 'maindb':
				case 'usersdb':
					query = 'SELECT name AS login FROM users WHERE id = ?';
					db = dbconn.usersdb;
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
			db = dbconn.sitedb;
			query = 'SELECT id FROM users WHERE login = ?';
		} else {
			switch (db) {
				case 'gcdb':
				case 'sitedb':
					query = 'SELECT id FROM users WHERE login = ?';
					db = dbconn.sitedb;
					break;

				case 'maindb':
				case 'usersdb':
					query = 'SELECT id FROM users WHERE name = ?';
					db = dbconn.usersdb;
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
		if (!dbconn.sitedb) return cb('You\'re not connected to GC MySQL DB');

		dbconn.sitedb.query('SELECT login, id FROM users WHERE login = ?', [login], function (err, result) {
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
			dbconn.sitedb.query('SELECT reg_date FROM users WHERE id = ?', [user], function (err, result) {
				if (err) return cb(err);

				if (result.length !== 0) {
					cb(null, result[0].reg_date);
				}
			});
		} else if (typeof user === 'string') {
			dbconn.sitedb.query('SELECT reg_date FROM users WHERE login = ?', [user], function (err, result) {
				if (err) return cb(err);

				cb(null, result[0].reg_date);
			});
		} else {
			cb('Incorrect variable!');
		}
	},


};

GCDB.prototype.org = org = {
	getByID: function getByID(id, cb) {
		if (!dbconn.sitedb) return cb('You\'re not connected to GC MySQL DB');

		dbconn.orgdb.query('SELECT * FROM organizations WHERE id = ?', [id], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0]);
			} else {
				cb(null, null);
			}
		});
	},

	getByTag: function getByTag(tag, cb) {
		if (!dbconn.sitedb) return cb('You\'re not connected to GC MySQL DB');

		dbconn.orgdb.query('SELECT * FROM organizations WHERE tag = ?', [tag], function (err, result) {
			if (err) return cb(err);

			if (result.length !== 0) {
				cb(null, result[0]);
			} else {
				cb(null, null);
			}
		});
	}
};

GCDB.prototype.api = {
	apps: {
		list: function (uid, showAll, cb) {
			var query = '';

			if (showAll) {
				query = 'SELECT * FROM client WHERE 1';
			} else {
				query = 'SELECT * FROM client WHERE owner = ' + uid;
			}

			dbconn.apidb.query(query, function (err, result) {
				if (err) return cb(err);

				if (result.length !== 0) {
					cb(null, result);
				} else {
					cb(null, []);
				}
			});
		},

		get: function (id, cb) {
			dbconn.apidb.query('SELECT * FROM client WHERE id = ?', [id], function (err, result) {
				if (err) return cb(err);

				if (result.length !== 0) {
					cb(null, result[0]);
				} else {
					cb(null, null);
				}
			});
		},

		edit: function (app, cb) {
			var query = 'INSERT INTO client (`name`, `clientSecret`,`redirectURI`,`scope`,`id`,`createdAt`,`updatedAt`,`homeURI`,`owner`,`description`,`internal`) ' +
				'VALUES (' +
				"'" + app.name + "'" +
				"'" + app.clientSecret + "'" +
				"'" + app.naredirectURIme + "'" +
				"'" + app.scope + "'" +
				"'" + app.id + "'" +
				"'" + app.createdAt + "'" +
				"'" + app.updatedAt + "'" +
				"'" + app.homeURI + "'" +
				"'" + app.owner + "'" +
				"'" + app.description + "'" +
				"" + (+app.internal) + "" +
				');';

			dbconn.apidb.query(query, function (err, result) {
				if (err) return cb(err);

				if (result.length !== 0) {
					cb(null, result[0]);
				} else {
					cb(null, null);
				}
			});
		},

		delete: function (id, cb) {
			dbconn.apidb.query('DELETE FROM client WHERE id = ?', [id], function (err, result) {
				if (err) return cb(err);

				if (result.length !== 0) {
					cb(null, true);
				} else {
					cb(null, false);
				}
			});
		}
	},

	tokens: {
		listByUser: function (uid, cb) {
			dbconn.apidb.query('SELECT id, createdAt, upadtedAt, clientId, userId, scope FROM token WHERE userId = ?', [uid], function (err, result) {
				if (err) return cb(err);

				if (result.length !== 0) {
					cb(null, result);
				} else {
					cb(null, []);
				}
			});
		},

		listByApp: function (id, cb) {
			dbconn.apidb.query('SELECT id, createdAt, upadtedAt, clientId, userId, scope FROM token WHERE clientId = ?', [id], function (err, result) {
				if (err) return cb(err);

				if (result.length !== 0) {
					cb(null, result);
				} else {
					cb(null, []);
				}
			});
		},

		deleteByUser: function (uid, cb) {
			dbconn.apidb.query('DELETE FROM token WHERE userId = ?', [uid], function (err, result) {
				if (err) return cb(err);

				if (result.length !== 0) {
					cb(null, true);
				} else {
					cb(null, false);
				}
			});
		},

		deleteByApp: function (id, cb) {
			dbconn.apidb.query('DELETE FROM token WHERE clientId = ?', [id], function (err, result) {
				if (err) return cb(err);

				if (result.length !== 0) {
					cb(null, true);
				} else {
					cb(null, false);
				}
			});
		},
	}
};
