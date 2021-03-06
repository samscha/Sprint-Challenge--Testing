const mongoose = require('mongoose');
const chai = require('chai');
const chaihttp = require('chai-http');
const { expect } = chai;
const sinon = require('sinon');

const Game = require('./models');
const server = require('./server');

chai.use(chaihttp);

describe('Games', () => {
  before(done => {
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/test');
    const db = mongoose.connection;
    db.on('error', () => console.error.bind(console, 'connection error'));
    db.once('open', () => {
      console.log('\n*~*~*~*~*~*~*~*~*~ we are connected ~*~*~*~*~*~*~*~*~*\n');
      done();
    });
  });

  after(done => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
      console.log('\n*~*~*~*~*~*~*~*~ we are disconnected *~*~*~*~*~*~*~*~*\n');
    });
  });
  // declare some global variables for use of testing
  // hint - these wont be constants because you'll need to override them.
  let games = [
    {
      title: 'California Games',
      genre: 'Sports',
      releaseDate: 'June 1987',
    },
    {
      title: 'Washington Games',
      genre: 'Recreational',
    },
    {
      title: 'Vancouver Games',
      genre: 'Chill',
      releaseDate: 'March 2018',
    },
    {
      title: 'Oregon Games',
      genre: 'Recreational',
      releaseDate: 'July 2017',
    },
    {
      title: 'Texas Games',
      genre: 'Cattle',
      releaseDate: 'December 2016',
    },
  ];

  beforeEach(done => {
    // write a beforeEach hook that will populate your test DB with data
    // each time this hook runs, you should save a document to your db
    // by saving the document you'll be able to use it in each of your `it` blocks

    Game.remove(_ => {
      Promise.all(
        games.map(
          game =>
            new Promise((resolve, reject) => {
              Game(game)
                .save()
                .then(savedGame => resolve(savedGame))
                .catch(err => reject(err));
            }),
        ),
      )
        .then(values => {
          games = JSON.parse(JSON.stringify(values));

          done();
        })
        .catch(reason => done());
    });
  });

  afterEach(done => {
    // simply remove the collections from your DB.
    gameIds = [];
    Game.remove(_ => done());
  });

  // test the POST here
  describe(`[POST] /api/game/create`, _ => {
    describe('SUCCESS', _ => {
      it('should return a status code of 200 when a game is saved', done => {
        const game = {
          title: 'Lambda Games',
          genre: 'Computer Science',
          releaseDate: 'July 2017',
        };

        chai
          .request(server)
          .post('/api/game/create')
          .send(game)
          .end((err, res) => {
            expect(res).to.have.status(200);

            done();
          });
      });

      it('should return the saved game', done => {
        const game = {
          title: 'Lambda School Games',
          genre: 'Computer Science Academy',
          releaseDate: 'January 2018',
        };

        chai
          .request(server)
          .post('/api/game/create')
          .send(game)
          .end((err, res) => {
            expect(res.body.title).to.equal(game.title);
            expect(res.body.genre).to.equal(game.genre);
            expect(res.body.releaseDate).to.equal(game.releaseDate);
            expect(res.body.__v).to.not.equal(null);
            expect(res.body._id).to.not.equal(null);

            done();
          });
      });
    });

    describe('NO TITLE', _ => {
      it('should return a status code of 422 when no title is supplied', done => {
        const game = {
          genre: 'Computer Science Academy',
          releaseDate: 'January 2018',
        };

        chai
          .request(server)
          .post('/api/game/create')
          .send(game)
          .end((err, res) => {
            expect(res).to.have.status(422);

            done();
          });
      });

      it('should return the correct error name in the err when no title is supplied', done => {
        const game = {
          genre: 'Computer Science Academy',
          releaseDate: 'January 2018',
        };

        chai
          .request(server)
          .post('/api/game/create')
          .send(game)
          .end((err, res) => {
            expect(err.response.body.message.name).to.equal('ValidationError');

            done();
          });
      });
    });

    describe('NO GENRE', _ => {
      it('should return a status code of 422 when no genre is supplied', done => {
        const game = {
          title: 'Lambda School Games',
          releaseDate: 'January 2018',
        };

        chai
          .request(server)
          .post('/api/game/create')
          .send(game)
          .end((err, res) => {
            expect(res).to.have.status(422);

            done();
          });
      });

      it('should return the correct error name in the err when no genre is supplied', done => {
        const game = {
          title: 'Lambda School Games',
          releaseDate: 'January 2018',
        };

        chai
          .request(server)
          .post('/api/game/create')
          .send(game)
          .end((err, res) => {
            expect(err.response.body.message.name).to.equal('ValidationError');

            done();
          });
      });
    });

    describe('NO RELEASE DATE', _ => {
      it('should return a status code of 200 when no releaseDate is supplied', done => {
        const game = {
          title: 'Lambda School Games',
          genre: 'Computer Science Academy',
        };

        chai
          .request(server)
          .post('/api/game/create')
          .send(game)
          .end((err, res) => {
            expect(res).to.have.status(200);

            done();
          });
      });

      it('should return the saved game when no releaseDate is supplied', done => {
        const game = {
          title: 'Lambda School Games',
          genre: 'Computer Science Academy',
        };

        chai
          .request(server)
          .post('/api/game/create')
          .send(game)
          .end((err, res) => {
            expect(res.body.title).to.equal(game.title);
            expect(res.body.genre).to.equal(game.genre);
            expect(res.body.__v).to.not.equal(null);
            expect(res.body._id).to.not.equal(null);

            done();
          });
      });
    });
  });

  // test the GET here
  describe(`[GET] /api/game/get`, _ => {
    describe('SUCCESS', _ => {
      it('should return a status code of 200 when retrieving games', done => {
        chai
          .request(server)
          .get('/api/game/get')
          .end((err, res) => {
            expect(res).to.have.status(200);

            done();
          });
      });

      it('should return an Array when retrieving games', done => {
        chai
          .request(server)
          .get('/api/game/get')
          .end((err, res) => {
            expect(res.body).to.be.an('array');

            done();
          });
      });

      it('should return the correct list of games', done => {
        chai
          .request(server)
          .get('/api/game/get')
          .end((err, res) => {
            expect(res.body.length).to.equal(games.length);

            res.body.forEach(game => {
              const gameTest = games.find(e => e.title === game.title);

              expect(game).to.deep.equal(gameTest);
            });

            done();
          });
      });
    });
    describe('EMPTY DATABASE', _ => {
      it('should return a status code of 200 when there are no games in the databse', done => {
        Game.remove(_ => {
          chai
            .request(server)
            .get('/api/game/get')
            .end((err, res) => {
              expect(res).to.have.status(200);

              done();
            });
        });
      });

      it('should return an empty Array when there are no games in the databse', done => {
        Game.remove(_ => {
          chai
            .request(server)
            .get('/api/game/get')
            .end((err, res) => {
              expect(res.body).to.be.an('array');
              expect(res.body.length).to.equal(0);

              done();
            });
        });
      });
    });
  });

  // test the PUT here
  describe(`[PUT] /api/game/update`, _ => {
    describe('SUCCESS', _ => {
      it('should return a status code of 200 when updating a game', done => {
        chai
          .request(server)
          .put('/api/game/update')
          .send({ title: 'Testing update', id: games[0]._id })
          .end((err, res) => {
            expect(res).to.have.status(200);

            done();
          });
      });

      it('should return the updated game', done => {
        const testTitle = 'Testing update';

        chai
          .request(server)
          .put('/api/game/update')
          .send({ title: testTitle, id: games[0]._id })
          .end((err, res) => {
            expect(res.body).to.deep.equal({ ...games[0], title: testTitle });

            done();
          });
      });
    });

    describe('NO TITLE', _ => {
      it('should return a status code of 422 when a title is not specified', done => {
        chai
          .request(server)
          .put('/api/game/update')
          .send({ id: games[0]._id })
          .end((err, res) => {
            expect(res).to.have.status(422);

            done();
          });
      });

      it('should return an error in the response body when a title is not specified', done => {
        chai
          .request(server)
          .put('/api/game/update')
          .send({ id: games[0]._id })
          .end((err, res) => {
            expect(res.body).to.have.property('error');

            done();
          });
      });
    });

    describe('NO ID', _ => {
      it('should return a status code of 422 when an id is not specified', done => {
        chai
          .request(server)
          .put('/api/game/update')
          .send({ title: 'Testing update' })
          .end((err, res) => {
            expect(res).to.have.status(422);

            done();
          });
      });

      it('should return an error in the response body when an id is not specified', done => {
        chai
          .request(server)
          .put('/api/game/update')
          .send({ title: 'Testing update' })
          .end((err, res) => {
            expect(res.body).to.have.property('error');

            done();
          });
      });
    });

    describe('ID NOT FOUND', _ => {
      it('should return a status code of 422 when receiving an id not in the database', done => {
        const testTitle = 'Testing update';
        const id = '1234567890abcdefghijklmnopqrstuvwxyz';

        chai
          .request(server)
          .put('/api/game/update')
          .send({ title: testTitle, id })
          .end((err, res) => {
            expect(res).to.have.status(422);

            done();
          });
      });

      it('should return an error in the response body when receiving an id not in the database', done => {
        const testTitle = 'Testing update';
        const id = '1234567890abcdefghijklmnopqrstuvwxyz';

        chai
          .request(server)
          .put('/api/game/update')
          .send({ title: testTitle, id })
          .end((err, res) => {
            expect(res.body).to.have.property('error');

            done();
          });
      });
    });

    describe('BAD ID', _ => {
      it('should return a status code of 422 when receiving a malformed id', done => {
        const testTitle = 'Testing update';
        const id = '-1';

        chai
          .request(server)
          .put('/api/game/update')
          .send({ title: testTitle, id })
          .end((err, res) => {
            expect(res).to.have.status(422);

            done();
          });
      });

      it('should return an error in the response body when receiving a malformed id', done => {
        const testTitle = 'Testing update';
        const id = '-1';

        chai
          .request(server)
          .put('/api/game/update')
          .send({ title: testTitle, id })
          .end((err, res) => {
            expect(res.body).to.have.property('error');

            done();
          });
      });
    });

    describe(`[DELETE] /api/game/destroy`, _ => {
      describe('SUCCESS', _ => {
        it('should return a status code of 200 when deleting a game', done => {
          chai
            .request(server)
            .delete('/api/game/destroy')
            .send({ id: games[0]._id })
            .end((err, res) => {
              expect(res).to.have.status(200);

              done();
            });
        });

        it("should return sucess in the response body with the deleted game's title", done => {
          chai
            .request(server)
            .delete('/api/game/destroy')
            .send({ id: games[0]._id })
            .end((err, res) => {
              expect(res.body).to.have.property('success');
              expect(res.body.success).to.have.string(games[0].title);

              done();
            });
        });
      });

      describe('ID NOT FOUND', _ => {
        it('should return a status code of 422 when receiving an id not in the database', done => {
          const id = '1234567890abcdefghijklmnopqrstuvwxyz';

          chai
            .request(server)
            .delete('/api/game/destroy')
            .send({ id })
            .end((err, res) => {
              expect(res).to.have.status(422);

              done();
            });
        });

        it('should return an error in the response body when receiving an id not in the database', done => {
          const id = '1234567890abcdefghijklmnopqrstuvwxyz';

          chai
            .request(server)
            .delete('/api/game/destroy')
            .send({ id })
            .end((err, res) => {
              expect(res.body).to.have.property('error');

              done();
            });
        });
      });

      describe('BAD ID', _ => {
        it('should return a status code of 422 when receiving a malformed id', done => {
          const id = '-1';

          chai
            .request(server)
            .delete('/api/game/destroy')
            .send({ id })
            .end((err, res) => {
              expect(res).to.have.status(422);

              done();
            });
        });

        it('should return an error in the response body when receiving a malformed id', done => {
          const id = '-1';

          chai
            .request(server)
            .delete('/api/game/destroy')
            .send({ id })
            .end((err, res) => {
              expect(res.body).to.have.property('error');

              done();
            });
        });
      });
    });

    describe(`[DELETE] /api/game/destroy/id`, _ => {
      describe('SUCCESS', _ => {
        it('should return a status code of 200 when deleting a game', done => {
          chai
            .request(server)
            .delete(`/api/game/destroy/${games[0]._id}`)
            .end((err, res) => {
              expect(res).to.have.status(200);

              done();
            });
        });

        it("should return sucess in the response body with the deleted game's title", done => {
          chai
            .request(server)
            .delete(`/api/game/destroy/${games[0]._id}`)
            .end((err, res) => {
              expect(res.body).to.have.property('success');
              expect(res.body.success).to.have.string(games[0].title);

              done();
            });
        });
      });

      describe('ID NOT FOUND', _ => {
        it('should return a status code of 422 when receiving an id not in the database', done => {
          const id = '1234567890abcdefghijklmnopqrstuvwxyz';

          chai
            .request(server)
            .delete(`/api/game/destroy/${id}`)
            .end((err, res) => {
              expect(res).to.have.status(422);

              done();
            });
        });

        it('should return an error in the response body when receiving an id not in the database', done => {
          const id = '1234567890abcdefghijklmnopqrstuvwxyz';

          chai
            .request(server)
            .delete(`/api/game/destroy/${id}`)
            .end((err, res) => {
              expect(res.body).to.have.property('error');

              done();
            });
        });
      });

      describe('BAD ID', _ => {
        it('should return a status code of 422 when receiving a malformed id', done => {
          const id = '-1';

          chai
            .request(server)
            .delete(`/api/game/destroy/${id}`)
            .end((err, res) => {
              expect(res).to.have.status(422);

              done();
            });
        });

        it('should return an error in the response body when receiving a malformed id', done => {
          const id = '-1';

          chai
            .request(server)
            .delete(`/api/game/destroy/${id}`)
            .end((err, res) => {
              expect(res.body).to.have.property('error');

              done();
            });
        });
      });
    });
  });

  // --- Stretch Problem ---
  // Test the DELETE here
});
