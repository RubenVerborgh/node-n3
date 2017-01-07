var N3Store = require('../N3').Store;

describe('N3Store', function () {
  describe('The N3Store module', function () {
    it('should be a function', function () {
      N3Store.should.be.a('function');
    });

    it('should make N3Store objects', function () {
      N3Store().should.be.an.instanceof(N3Store);
    });

    it('should be an N3Store constructor', function () {
      new N3Store().should.be.an.instanceof(N3Store);
    });
  });

  describe('An empty N3Store', function () {
    var store = new N3Store();

    it('should have size 0', function () {
      expect(store.size).to.eql(0);
    });

    it('should be empty', function () {
      store.find().should.be.empty;
    });

    describe('every()', function () {
      function trueFn (q) {
        return true;
      }
      function falseFn (q) {
        return false;
      }
      describe('with no parameters and a callback always returning true', function () {
        it('should return false', function () {
          store.every(trueFn, null, null, null, null).should.be.false;
        });
      });
      describe('with no parameters and a callback always returning false', function () {
        it('should return false', function () {
          store.every(falseFn, null, null, null, null).should.be.false;
        });
      });
    });

    describe('some()', function () {
      function trueFn (q) {
        return true;
      }
      function falseFn (q) {
        return false;
      }
      describe('with no parameters and a callback always returning true', function () {
        it('should return false', function () {
          store.some(trueFn, null, null, null, null).should.be.false;
        });
      });
      describe('with no parameters and a callback always returning false', function () {
        it('should return false', function () {
          store.some(falseFn, null, null, null, null).should.be.false;
        });
      });
    });

    it('should still have size 0 (instead of null) after adding and removing a triple', function () {
      expect(store.size).to.eql(0);
      store.addTriple('a', 'b', 'c').should.be.true;
      store.removeTriple('a', 'b', 'c').should.be.true;
      expect(store.size).to.eql(0);
    });

    it('should be able to generate unnamed blank nodes', function () {
      store.createBlankNode().should.eql('_:b0');
      store.createBlankNode().should.eql('_:b1');

      store.addTriple('_:b0', '_:b1', '_:b2').should.be.true;
      store.createBlankNode().should.eql('_:b3');
      store.removeTriples(store.find());
    });

    it('should be able to generate named blank nodes', function () {
      store.createBlankNode('blank').should.eql('_:blank');
      store.createBlankNode('blank').should.eql('_:blank1');
      store.createBlankNode('blank').should.eql('_:blank2');
    });

    it('should be able to store triples with generated blank nodes', function () {
      store.addTriple(store.createBlankNode('x'), 'b', 'c').should.be.true;
      shouldIncludeAll(store.find(null, 'b'), ['_:x1', 'b', 'd']);
      store.removeTriples(store.find());
    });

    it('should have a fixed default graph', function () {
      store.defaultGraph.should.eql('urn:n3:defaultGraph');
    });
  });

  describe('An N3Store with initialized with 3 elements', function () {
    var store = new N3Store([
      { subject: 's1', predicate: 'p1', object: 'o1' },
      { subject: 's1', predicate: 'p1', object: 'o2' },
      { subject: 's1', predicate: 'p1', object: 'o3' },
    ]);

    it('should have size 3', function () {
      store.size.should.eql(3);
    });

    describe('adding a triple that already exists', function () {
      it('should return false', function () {
        store.addTriple('s1', 'p1', 'o1').should.be.false;
      });

      it('should not increase the size', function () {
        store.size.should.eql(3);
      });
    });

    describe('adding a triple that did not exist yet', function () {
      it('should return true', function () {
        store.addTriple('s1', 'p1', 'o4').should.be.true;
      });

      it('should increase the size', function () {
        store.size.should.eql(4);
      });
    });

    describe('removing an existing triple', function () {
      it('should return true', function () {
        store.removeTriple('s1', 'p1', 'o4').should.be.true;
      });

      it('should decrease the size', function () {
        store.size.should.eql(3);
      });
    });

    describe('removing a non-existing triple', function () {
      it('should return false', function () {
        store.removeTriple('s1', 'p1', 'o5').should.be.false;
      });

      it('should not decrease the size', function () {
        store.size.should.eql(3);
      });
    });
  });

  describe('An N3Store with 5 elements', function () {
    var store = new N3Store();
    store.addTriple('s1', 'p1', 'o1').should.be.true;
    store.addTriple({ subject: 's1', predicate: 'p1', object: 'o2' }).should.be.true;
    store.addTriples([
      { subject: 's1', predicate: 'p2', object: 'o2' },
      { subject: 's2', predicate: 'p1', object: 'o1' },
    ]);
    store.addTriple('s1', 'p2', 'o3', 'c4').should.be.true;

    it('should have size 5', function () {
      store.size.should.eql(5);
    });

    describe('when searched without parameters', function () {
      it('should return all items',
        shouldIncludeAll(store.find(),
                         ['s1', 'p1', 'o1'],
                         ['s1', 'p1', 'o2'],
                         ['s1', 'p2', 'o2'],
                         ['s2', 'p1', 'o1'],
                         ['s1', 'p2', 'o3', 'c4']));
    });

    describe('when searched with an existing subject parameter', function () {
      it('should return all items with this subject in all graphs',
        shouldIncludeAll(store.find('s1', null, null),
                         ['s1', 'p1', 'o1'],
                         ['s1', 'p1', 'o2'],
                         ['s1', 'p2', 'o2'],
                         ['s1', 'p2', 'o3', 'c4']));
    });

    describe('when searched with a non-existing subject parameter', function () {
      itShouldBeEmpty(store.find('s3', null, null));
    });

    describe('when searched with a non-existing subject parameter that exists elsewhere', function () {
      itShouldBeEmpty(store.find('p1', null, null));
    });

    describe('when searched with an existing predicate parameter', function () {
      it('should return all items with this predicate in the default graph',
        shouldIncludeAll(store.find(null, 'p1', null),
                         ['s1', 'p1', 'o1'],
                         ['s1', 'p1', 'o2'],
                         ['s2', 'p1', 'o1']));
    });

    describe('when searched with a non-existing predicate parameter', function () {
      itShouldBeEmpty(store.find(null, 'p3', null));
    });

    describe('when searched with an existing object parameter', function () {
      it('should return all items with this object in the default graph',
        shouldIncludeAll(store.find(null, null, 'o1'),
            ['s1', 'p1', 'o1'],
            ['s2', 'p1', 'o1']));
    });

    describe('when searched with a non-existing object parameter', function () {
      itShouldBeEmpty(store.find(null, null, 'o4'));
    });

    describe('when searched with existing subject and predicate parameters', function () {
      it('should return all items with this subject and predicate in the default graph',
        shouldIncludeAll(store.find('s1', 'p1', null),
            ['s1', 'p1', 'o1'],
            ['s1', 'p1', 'o2']));
    });

    describe('when searched with non-existing subject and predicate parameters', function () {
      itShouldBeEmpty(store.find('s2', 'p2', null));
    });

    describe('when searched with existing subject and object parameters', function () {
      it('should return all items with this subject and object in the default graph',
        shouldIncludeAll(store.find('s1', null, 'o2'),
            ['s1', 'p1', 'o2'],
            ['s1', 'p2', 'o2']));
    });

    describe('when searched with non-existing subject and object parameters', function () {
      itShouldBeEmpty(store.find('s2', 'p2', null));
    });

    describe('when searched with existing predicate and object parameters', function () {
      it('should return all items with this predicate and object in the default graph',
        shouldIncludeAll(store.find(null, 'p1', 'o1'),
            ['s1', 'p1', 'o1'],
            ['s2', 'p1', 'o1']));
    });

    describe('when searched with non-existing predicate and object parameters in the default graph', function () {
      itShouldBeEmpty(store.find(null, 'p2', 'o3', store.defaultGraph));
    });

    describe('when searched with existing subject, predicate, and object parameters', function () {
      it('should return all items with this subject, predicate, and object in the default graph',
        shouldIncludeAll(store.find('s1', 'p1', 'o1'), ['s1', 'p1', 'o1']));
    });

    describe('when searched with a non-existing triple', function () {
      itShouldBeEmpty(store.find('s2', 'p2', 'o1'));
    });

    describe('when searched with the default graph parameter', function () {
      it('should return all items in the default graph',
        shouldIncludeAll(store.find(null, null, null, store.defaultGraph),
                         ['s1', 'p1', 'o1'],
                         ['s1', 'p1', 'o2'],
                         ['s1', 'p2', 'o2'],
                         ['s2', 'p1', 'o1']));
    });

    describe('when searched with an existing non-default graph parameter', function () {
      it('should return all items in that graph',
        shouldIncludeAll(store.find(null, null, null, 'c4'), ['s1', 'p2', 'o3', 'c4']));
    });

    describe('when searched with a non-existing non-default graph parameter', function () {
      itShouldBeEmpty(store.find(null, null, null, 'c5'));
    });

    describe('findGraphs()', function () {

      describe('with existing subject, predicate and object parameters', function () {
        it('should return all graphs with this subject, predicate and object', function () {
          store.findGraphs('s1', 'p2', 'o3').should.have.members(['c4']);
        });
      });

      describe('with existing subject and predicate parameters', function () {
        it('should return all graphs with this subject and predicate', function () {
          store.findGraphs('s1', 'p2', null).should.have.members(['c4', '']);
        });
      });

      describe('with existing subject and object parameters', function () {
        it('should return all graphs with this subject and object', function () {
          store.findGraphs('s1', null, 'o2').should.have.members(['']);
        });
      });

      describe('with existing predicate and object parameters', function () {
        it('should return all graphs with this predicate and object', function () {
          store.findGraphs(null, 'p2', 'o3').should.have.members(['c4']);
        });
      });

      describe('with an existing subject parameter', function () {
        it('should return all graphs with this subject', function () {
          store.findGraphs('s1', null, null).should.have.members(['c4', '']);
        });
      });

      describe('with an existing predicate parameter', function () {
        it('should return all graphs with this predicate', function () {
          store.findGraphs(null, 'p2', null).should.have.members(['c4', '']);
        });
      });

      describe('with an existing object parameter', function () {
        it('should return all graphs with this object', function () {
          store.findGraphs(null, null, 'o3').should.have.members(['c4']);
        });
      });

      describe('with no parameters', function () {
        it('should return all graphs', function () {
          store.findGraphs(null, null, null).should.have.members(['c4', '']);
        });
      });
    });

    describe('findSubjects()', function () {

      describe('with existing predicate, object and graph parameters', function () {
        it('should return all subjects with this predicate, object and graph', function () {
          store.findSubjects('p2', 'o3', 'c4').should.have.members(['s1']);
        });
      });

      describe('with existing predicate and object parameters', function () {
        it('should return all subjects with this predicate and object', function () {
          store.findSubjects('p2', 'o2', null).should.have.members(['s1']);
        });
      });

      describe('with existing predicate and graph parameters', function () {
        it('should return all subjects with this predicate and graph', function () {
          store.findSubjects('p1', null, store.defaultGraph).should.have.members(['s1', 's2']);
        });
      });

      describe('with existing object and graph parameters', function () {
        it('should return all subjects with this object and graph', function () {
          store.findSubjects(null, 'o1', store.defaultGraph).should.have.members(['s1', 's2']);
        });
      });

      describe('with an existing predicate parameter', function () {
        it('should return all subjects with this predicate', function () {
          store.findSubjects('p1', null, null).should.have.members(['s1', 's2']);
        });
      });

      describe('with an existing object parameter', function () {
        it('should return all subjects with this object', function () {
          store.findSubjects(null, 'o1', null).should.have.members(['s1', 's2']);
        });
      });

      describe('with an existing graph parameter', function () {
        it('should return all subjects in the graph', function () {
          store.findSubjects(null, null, 'c4').should.have.members(['s1']);
        });
      });

      describe('with no parameters', function () {
        it('should return all subjects', function () {
          store.findSubjects(null, null, null).should.have.members(['s1', 's2']);
        });
      });
    });

    describe('findPredicates()', function () {

      describe('with existing subject, object and graph parameters', function () {
        it('should return all predicates with this subject, object and graph', function () {
          store.findPredicates('s1', 'o3', 'c4').should.have.members(['p2']);
        });
      });

      describe('with existing subject and object parameters', function () {
        it('should return all predicates with this subject and object', function () {
          store.findPredicates('s1', 'o2', null).should.have.members(['p1', 'p2']);
        });
      });

      describe('with existing subject and graph parameters', function () {
        it('should return all predicates with this subject and graph', function () {
          store.findPredicates('s1', null, store.defaultGraph).should.have.members(['p1', 'p2']);
        });
      });

      describe('with existing object and graph parameters', function () {
        it('should return all predicates with this object and graph', function () {
          store.findPredicates(null, 'o1', store.defaultGraph).should.have.members(['p1']);
        });
      });

      describe('with an existing subject parameter', function () {
        it('should return all predicates with this subject', function () {
          store.findPredicates('s2', null, null).should.have.members(['p1']);
        });
      });

      describe('with an existing object parameter', function () {
        it('should return all predicates with this object', function () {
          store.findPredicates(null, 'o1', null).should.have.members(['p1']);
        });
      });

      describe('with an existing graph parameter', function () {
        it('should return all predicates in the graph', function () {
          store.findPredicates(null, null, 'c4').should.have.members(['p2']);
        });
      });

      describe('with no parameters', function () {
        it('should return all predicates', function () {
          store.findPredicates(null, null, null).should.have.members(['p1', 'p2']);
        });
      });
    });

    describe('findObjects()', function () {

      describe('with existing subject, predicate and graph parameters', function () {
        it('should return all objects with this subject, predicate and graph', function () {
          store.findObjects('s1', 'p1', store.defaultGraph).should.have.members(['o1', 'o2']);
        });
      });

      describe('with existing subject and predicate parameters', function () {
        it('should return all objects with this subject and predicate', function () {
          store.findObjects('s1', 'p2', null).should.have.members(['o2', 'o3']);
        });
      });

      describe('with existing subject and graph parameters', function () {
        it('should return all objects with this subject and graph', function () {
          store.findObjects('s1', null, store.defaultGraph).should.have.members(['o1', 'o2']);
        });
      });

      describe('with existing predicate and graph parameters', function () {
        it('should return all objects with this predicate and graph', function () {
          store.findObjects(null, 'p1', store.defaultGraph).should.have.members(['o1', 'o2']);
        });
      });

      describe('with an existing subject parameter', function () {
        it('should return all objects with this subject', function () {
          store.findObjects('s1', null, null).should.have.members(['o1', 'o2', 'o3']);
        });
      });

      describe('with an existing predicate parameter', function () {
        it('should return all objects with this predicate', function () {
          store.findObjects(null, 'p2', null).should.have.members(['o2', 'o3']);
        });
      });

      describe('with an existing graph parameter', function () {
        it('should return all objects in the graph', function () {
          store.findObjects(null, null, 'c4').should.have.members(['o3']);
        });
      });

      describe('with no parameters', function () {
        it('should return all objects', function () {
          store.findObjects(null, null, null).should.have.members(['o1', 'o2', 'o3']);
        });
      });
    });

    describe('forEach()', function () {

      var quads = [];
      function resultCollectorFn (q) {
        quads.push(q);
      }

      describe('with existing subject, predicate, object and graph parameters', function () {
        store.forEach(resultCollectorFn, 's1', 'p1', 'o2', store.defaultGraph);
        it('should have iterated all items with this subject, predicate, object and graph',
          shouldIncludeAll(quads, ['s1', 'p1', 'o2', '']));
        quads = [];
      });

      describe('with existing subject, predicate and object parameters', function () {
        store.forEach(resultCollectorFn, 's1', 'p2', 'o3', null);
        it('should have iterated all items with this subject, predicate and object',
          shouldIncludeAll(quads, ['s1', 'p2', 'o3', 'c4']));
        quads = [];
      });

      describe('with existing subject, predicate and graph parameters', function () {
        store.forEach(resultCollectorFn, 's1', 'p1', null, store.defaultGraph);
        it('should have iterated all items with this subject, predicate and graph',
          shouldIncludeAll(quads, ['s1', 'p1', 'o1', ''], ['s1', 'p1', 'o2', '']));
        quads = [];
      });

      describe('with existing subject, object and graph parameters', function () {
        store.forEach(resultCollectorFn, 's1', null, 'o2', store.defaultGraph);
        it('should have iterated all items with this subject, object and graph',
          shouldIncludeAll(quads, ['s1', 'p1', 'o2', ''], ['s1', 'p2', 'o2', '']));
        quads = [];
      });

      describe('with existing predicate, object and graph parameters', function () {
        store.forEach(resultCollectorFn, null, 'p1', 'o1', store.defaultGraph);
        it('should have iterated all items with this predicate, object and graph',
          shouldIncludeAll(quads, ['s1', 'p1', 'o1', ''], ['s2', 'p1', 'o1', '']));
        quads = [];
      });

      describe('with existing subject and predicate parameters', function () {
        store.forEach(resultCollectorFn, 's1', 'p2', null, null);
        it('should iterate all items with this subject and predicate',
          shouldIncludeAll(quads, ['s1', 'p2', 'o2', ''], ['s1', 'p2', 'o3', 'c4']));
        quads = [];
      });

      describe('with existing subject and object parameters', function () {
        store.forEach(resultCollectorFn, 's1', null, 'o2', null);
        it('should iterate all items with this subject and predicate',
          shouldIncludeAll(quads, ['s1', 'p1', 'o2', ''], ['s1', 'p2', 'o2', '']));
        quads = [];
      });

      describe('with existing subject and graph parameters', function () {
        store.forEach(resultCollectorFn, 's1', null, null, 'c4');
        it('should iterate all items with this subject and graph',
          shouldIncludeAll(quads, ['s1', 'p2', 'o3', 'c4']));
        quads = [];
      });

      describe('with existing predicate and object parameters', function () {
        store.forEach(resultCollectorFn, null, 'p1', 'o1', null);
        it('should iterate all items with this predicate and object',
          shouldIncludeAll(quads, ['s1', 'p1', 'o1', ''], ['s2', 'p1', 'o1', '']));
        quads = [];
      });

      describe('with existing predicate and graph parameters', function () {
        store.forEach(resultCollectorFn, null, 'p1', null, store.defaultGraph);
        it('should iterate all items with this predicate and graph',
          shouldIncludeAll(quads, ['s1', 'p1', 'o1', ''],
                                    ['s1', 'p1', 'o2', ''],
                                    ['s2', 'p1', 'o1', '']));
        quads = [];
      });

      describe('with existing object and graph parameters', function () {
        store.forEach(resultCollectorFn, null, null, 'o1', store.defaultGraph);
        it('should iterate all items with this object and graph',
          shouldIncludeAll(quads, ['s1', 'p1', 'o1', ''], ['s2', 'p1', 'o1', '']));
        quads = [];
      });

      describe('with existing subject parameter', function () {
        store.forEach(resultCollectorFn, 's2', null, null, null);
        it('should iterate all items with this subject',
          shouldIncludeAll(quads, ['s2', 'p1', 'o1', '']));
        quads = [];
      });

      describe('with existing predicate parameter', function () {
        store.forEach(resultCollectorFn, null, 'p2', null, null);
        it('should iterate all items with this predicate',
          shouldIncludeAll(quads, ['s1', 'p2', 'o2', ''], ['s1', 'p2', 'o3', 'c4']));
        quads = [];
      });

      describe('with existing object parameter', function () {
        store.forEach(resultCollectorFn, null, null, 'o1', null);
        it('should iterate all items with this object',
          shouldIncludeAll(quads, ['s1', 'p1', 'o1', ''], ['s2', 'p1', 'o1', '']));
        quads = [];
      });

      describe('with existing graph parameter', function () {
        store.forEach(resultCollectorFn, null, null, null, store.defaultGraph);
        it('should iterate all items with this graph',
          shouldIncludeAll(quads, ['s1', 'p1', 'o1'],
                                    ['s1', 'p1', 'o2'],
                                    ['s1', 'p2', 'o2'],
                                    ['s2', 'p1', 'o1']));
        quads = [];
      });

      describe('with no parameters', function () {
        store.forEach(resultCollectorFn, null, null, null, null);
        it('should iterate all items',
          shouldIncludeAll(quads, ['s1', 'p1', 'o1'],
                                    ['s1', 'p1', 'o2'],
                                    ['s1', 'p2', 'o2'],
                                    ['s2', 'p1', 'o1'],
                                    ['s1', 'p2', 'o3', 'c4']));
        quads = [];
      });
    });

    describe('forGraphs()', function () {
      var graphs = [];
      function resultCollectorFn (g) {
        graphs.push(g);
      }
      describe('with existing subject, predicate and object parameters', function () {
        it('should iterate all graphs with this subject, predicate and object', function () {
          store.forGraphs(resultCollectorFn, 's1', 'p1', 'o1');
          graphs.should.have.members(['']);
        });
        graphs = [];
      });
    });

    describe('forSubjects()', function () {
      var subjects = [];
      function resultCollectorFn (s) {
        subjects.push(s);
      }
      describe('with existing predicate, object and graph parameters', function () {
        it('should iterate all subjects with this predicate, object and graph', function () {
          store.forSubjects(resultCollectorFn, 'p1', 'o1', store.defaultGraph);
          subjects.should.have.members(['s1', 's2']);
        });
        subjects = [];
      });
    });

    describe('forPredicates()', function () {
      var predicates = [];
      function resultCollectorFn (p) {
        predicates.push(p);
      }
      describe('with existing subject, object and graph parameters', function () {
        it('should iterate all predicates with this subject, object and graph', function () {
          store.forPredicates(resultCollectorFn, 's1', 'o2', store.defaultGraph);
          predicates.should.have.members(['p1', 'p2']);
        });
        predicates = [];
      });
    });

    describe('forObjects()', function () {
      var objects = [];
      function resultCollectorFn (o) {
        objects.push(o);
      }
      describe('with existing subject, predicate and graph parameters', function () {
        it('should iterate all objects with this subject, predicate and graph', function () {
          store.forObjects(resultCollectorFn, 's1', 'p1', store.defaultGraph);
          objects.should.have.members(['o1', 'o2']);
        });
        objects = [];
      });
    });

    describe('every()', function () {
      function trueFn (q) {
        return true;
      }
      function falseFn (q) {
        return false;
      }
      var count = 3;
      function falseThirdTimeFn (q) {
        if (count > 0) {
          count--;
          return true;
        }
        return false;
      }
      describe('with no parameters and a callback always returning true', function () {
        it('should return true', function () {
          store.every(trueFn, null, null, null, null).should.be.true;
        });
      });
      describe('with no parameters and a callback always returning false', function () {
        it('should return false', function () {
          store.every(falseFn, null, null, null, null).should.be.false;
        });
      });
      describe('with no parameters and a callback that returns false after 3 calls', function () {
        it('should return false', function () {
          store.every(falseThirdTimeFn, null, null, null, null).should.be.false;
        });
      });
    });

    describe('some()', function () {
      function trueFn (q) {
        return true;
      }
      function falseFn (q) {
        return false;
      }
      var count = 3;
      function trueThirdTimeFn (q) {
        if (count > 0) {
          count--;
          return false;
        }
        return true;
      }
      describe('with no parameters and a callback always returning true', function () {
        it('should return true', function () {
          store.some(trueFn, null, null, null, null).should.be.true;
        });
      });
      describe('with no parameters and a callback always returning false', function () {
        it('should return false', function () {
          store.some(falseFn, null, null, null, null).should.be.false;
        });
      });
      describe('with no parameters and a callback that returns true after 3 calls', function () {
        it('should return false', function () {
          store.some(trueThirdTimeFn, null, null, null, null).should.be.true;
        });
      });
    });

    describe('when counted without parameters', function () {
      it('should count all items in the default graph', function () {
        store.count().should.equal(4);
      });
    });

    describe('when counted with an existing subject parameter', function () {
      it('should count all items with this subject in the default graph', function () {
        store.count('s1', null, null).should.equal(3);
      });
    });

    describe('when counted with a non-existing subject parameter', function () {
      it('should be empty', function () {
        store.count('s3', null, null).should.equal(0);
      });
    });

    describe('when counted with a non-existing subject parameter that exists elsewhere', function () {
      it('should be empty', function () {
        store.count('p1', null, null).should.equal(0);
      });
    });

    describe('when counted with an existing predicate parameter', function () {
      it('should count all items with this predicate in the default graph', function () {
        store.count(null, 'p1', null).should.equal(3);
      });
    });

    describe('when counted with a non-existing predicate parameter', function () {
      it('should be empty', function () {
        store.count(null, 'p3', null).should.equal(0);
      });
    });

    describe('when counted with an existing object parameter', function () {
      it('should count all items with this object in the default graph', function () {
        store.count(null, null, 'o1').should.equal(2);
      });
    });

    describe('when counted with a non-existing object parameter', function () {
      it('should be empty', function () {
        store.count(null, null, 'o4').should.equal(0);
      });
    });

    describe('when counted with existing subject and predicate parameters', function () {
      it('should count all items with this subject and predicate in the default graph', function () {
        store.count('s1', 'p1', null).should.equal(2);
      });
    });

    describe('when counted with non-existing subject and predicate parameters', function () {
      it('should be empty', function () {
        store.count('s2', 'p2', null).should.equal(0);
      });
    });

    describe('when counted with existing subject and object parameters', function () {
      it('should count all items with this subject and object in the default graph', function () {
        store.count('s1', null, 'o2').should.equal(2);
      });
    });

    describe('when counted with non-existing subject and object parameters', function () {
      it('should be empty', function () {
        store.count('s2', 'p2', null).should.equal(0);
      });
    });

    describe('when counted with existing predicate and object parameters', function () {
      it('should count all items with this predicate and object in the default graph', function () {
        store.count(null, 'p1', 'o1').should.equal(2);
      });
    });

    describe('when counted with non-existing predicate and object parameters', function () {
      it('should be empty', function () {
        store.count(null, 'p2', 'o3').should.equal(0);
      });
    });

    describe('when counted with existing subject, predicate, and object parameters', function () {
      it('should count all items with this subject, predicate, and object in the default graph', function () {
        store.count('s1', 'p1', 'o1').should.equal(1);
      });
    });

    describe('when counted with a non-existing triple', function () {
      it('should be empty', function () {
        store.count('s2', 'p2', 'o1').should.equal(0);
      });
    });

    describe('when counted with the default graph parameter', function () {
      it('should count all items in the default graph', function () {
        store.count().should.equal(4);
      });
    });

    describe('when counted with an existing non-default graph parameter', function () {
      it('should count all items in that graph', function () {
        store.count(null, null, null, 'c4').should.equal(1);
      });
    });

    describe('when counted with a non-existing non-default graph parameter', function () {
      it('should be empty', function () {
        store.count(null, null, null, 'c5').should.equal(0);
      });
    });

    describe('when trying to remove a triple with a non-existing subject', function () {
      before(function () { store.removeTriple('s0', 'p1', 'o1').should.be.false; });
      it('should still have size 5', function () { store.size.should.eql(5); });
    });

    describe('when trying to remove a triple with a non-existing predicate', function () {
      before(function () { store.removeTriple('s1', 'p0', 'o1').should.be.false; });
      it('should still have size 5', function () { store.size.should.eql(5); });
    });

    describe('when trying to remove a triple with a non-existing object', function () {
      before(function () { store.removeTriple('s1', 'p1', 'o0').should.be.false; });
      it('should still have size 5', function () { store.size.should.eql(5); });
    });

    describe('when trying to remove a triple for which no subjects exist', function () {
      before(function () { store.removeTriple('o1', 'p1', 'o1').should.be.false; });
      it('should still have size 5', function () { store.size.should.eql(5); });
    });

    describe('when trying to remove a triple for which no predicates exist', function () {
      before(function () { store.removeTriple('s1', 's1', 'o1').should.be.false; });
      it('should still have size 5', function () { store.size.should.eql(5); });
    });

    describe('when trying to remove a triple for which no objects exist', function () {
      before(function () { store.removeTriple('s1', 'p1', 's1').should.be.false; });
      it('should still have size 5', function () { store.size.should.eql(5); });
    });

    describe('when trying to remove a triple that does not exist', function () {
      before(function () { store.removeTriple('s1', 'p2', 'o1').should.be.false; });
      it('should still have size 5', function () { store.size.should.eql(5); });
    });

    describe('when trying to remove an incomplete triple', function () {
      before(function () { store.removeTriple('s1', null, null).should.be.false; });
      it('should still have size 5', function () { store.size.should.eql(5); });
    });

    describe('when trying to remove a triple with a non-existing graph', function () {
      before(function () { store.removeTriple('s1', 'p1', 'o1', 'c0').should.be.false; });
      it('should still have size 5', function () { store.size.should.eql(5); });
    });

    describe('when removing an existing triple', function () {
      before(function () { store.removeTriple('s1', 'p1', 'o1').should.be.true; });

      it('should have size 4', function () { store.size.should.eql(4); });

      it('should not contain that triple anymore',
        shouldIncludeAll(function () { return store.find(); },
                         ['s1', 'p1', 'o2'],
                         ['s1', 'p2', 'o2'],
                         ['s2', 'p1', 'o1'],
                         ['s1', 'p2', 'o3', 'c4']));
    });

    describe('when removing an existing triple from a non-default graph', function () {
      before(function () { store.removeTriple('s1', 'p2', 'o3', 'c4').should.be.true; });

      it('should have size 3', function () { store.size.should.eql(3); });

      itShouldBeEmpty(function () { return store.find(null, null, null, 'c4'); });
    });

    describe('when removing multiple triples', function () {
      before(function () {
        store.removeTriples([
          { subject: 's1', predicate: 'p2', object: 'o2' },
          { subject: 's2', predicate: 'p1', object: 'o1' },
        ]);
      });

      it('should have size 1', function () { store.size.should.eql(1); });

      it('should not contain those triples anymore',
        shouldIncludeAll(function () { return store.find(); },
                         ['s1', 'p1', 'o2']));
    });

    describe('when adding and removing a triple', function () {
      before(function () {
        store.addTriple('a', 'b', 'c').should.be.true;
        store.removeTriple('a', 'b', 'c').should.be.true;
      });

      it('should have an unchanged size', function () { store.size.should.eql(1); });
    });
  });

  describe('An N3Store initialized with prefixes', function () {
    var store = new N3Store([
      { subject: 'http://foo.org/#s1', predicate: 'http://bar.org/p1', object: 'http://foo.org/#o1' },
      { subject: 'http://foo.org/#s1', predicate: 'http://bar.org/p2', object: 'http://foo.org/#o1' },
      { subject: 'http://foo.org/#s2', predicate: 'http://bar.org/p1', object: 'http://foo.org/#o2' },
      { subject: 'http://foo.org/#s3', predicate: 'http://bar.org/p3', object: '"a"^^http://foo.org/#t1' },
      { subject: 'http://foo.org/#s1', predicate: 'http://bar.org/p1', object: 'http://foo.org/#o1', graph: 'http://graphs.org/#g1' },
    ],
    { prefixes: { a: 'http://foo.org/#', b: 'http://bar.org/', g: 'http://graphs.org/#' } });

    describe('should allow to query subjects with prefixes', function () {
      it('should return all triples with that subject',
          shouldIncludeAll(store.find('a:s1', null, null),
              ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1'],
              ['http://foo.org/#s1', 'http://bar.org/p2', 'http://foo.org/#o1'],
              ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1', 'http://graphs.org/#g1']));
    });

    describe('should allow to query subjects with prefixes', function () {
      it('should return all triples with that subject in the default graph',
          shouldIncludeAll(store.find('a:s1', null, null, store.defaultGraph),
              ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1'],
              ['http://foo.org/#s1', 'http://bar.org/p2', 'http://foo.org/#o1']));
    });

    describe('should allow to query predicates with prefixes', function () {
      it('should return all triples with that predicate',
        shouldIncludeAll(store.find(null, 'b:p1', null),
                         ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1'],
                         ['http://foo.org/#s2', 'http://bar.org/p1', 'http://foo.org/#o2'],
                         ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1', 'http://graphs.org/#g1']));
    });

    describe('should allow to query objects with prefixes', function () {
      it('should return all triples with that object',
        shouldIncludeAll(store.find(null, null, 'a:o1'),
                         ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1'],
                         ['http://foo.org/#s1', 'http://bar.org/p2', 'http://foo.org/#o1'],
                         ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1', 'http://graphs.org/#g1']));
    });

    describe('should allow to query graphs with prefixes', function () {
      it('should return all triples with that graph',
        shouldIncludeAll(store.find(null, null, null, 'http://graphs.org/#g1'),
          ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1', 'http://graphs.org/#g1']));
    });
  });

  describe('An N3Store with prefixes added later on', function () {
    var store = new N3Store([
      { subject: 'http://foo.org/#s1', predicate: 'http://bar.org/p1', object: 'http://foo.org/#o1' },
      { subject: 'http://foo.org/#s1', predicate: 'http://bar.org/p2', object: 'http://foo.org/#o1' },
      { subject: 'http://foo.org/#s2', predicate: 'http://bar.org/p1', object: 'http://foo.org/#o2' },
      { subject: 'http://foo.org/#s1', predicate: 'http://bar.org/p1', object: 'http://foo.org/#o1', graph: 'http://graphs.org/#g1' },
    ]);

    store.addPrefix('a', 'http://foo.org/#');
    store.addPrefixes({ b: 'http://bar.org/', g: 'http://graphs.org/#' });

    describe('should allow to query subjects with prefixes', function () {
      it('should return all triples with that subject in the default graph',
        shouldIncludeAll(store.find('a:s1', null, null, store.defaultGraph),
                         ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1'],
                         ['http://foo.org/#s1', 'http://bar.org/p2', 'http://foo.org/#o1']));
    });

    describe('should allow to query subjects with prefixes', function () {
      it('should return all triples with that subject',
          shouldIncludeAll(store.find('a:s1', null, null),
              ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1'],
              ['http://foo.org/#s1', 'http://bar.org/p2', 'http://foo.org/#o1'],
              ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1', 'http://graphs.org/#g1']));
    });

    describe('should allow to query predicates with prefixes', function () {
      it('should return all triples with that predicate in the default graph',
          shouldIncludeAll(store.find(null, 'b:p1', null, store.defaultGraph),
              ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1'],
              ['http://foo.org/#s2', 'http://bar.org/p1', 'http://foo.org/#o2']));
    });

    describe('should allow to query predicates with prefixes', function () {
      it('should return all triples with that predicate',
          shouldIncludeAll(store.find(null, 'b:p1', null),
              ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1'],
              ['http://foo.org/#s2', 'http://bar.org/p1', 'http://foo.org/#o2'],
              ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1', 'http://graphs.org/#g1']));
    });

    describe('should allow to query objects with prefixes', function () {
      it('should return all triples with that object in the default graph',
          shouldIncludeAll(store.find(null, null, 'a:o1', store.defaultGraph),
              ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1'],
              ['http://foo.org/#s1', 'http://bar.org/p2', 'http://foo.org/#o1']));
    });

    describe('should allow to query objects with prefixes', function () {
      it('should return all triples with that object',
        shouldIncludeAll(store.find(null, null, 'a:o1'),
                         ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1'],
                         ['http://foo.org/#s1', 'http://bar.org/p2', 'http://foo.org/#o1'],
                         ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1', 'http://graphs.org/#g1']));
    });

    describe('should allow to query graphs with prefixes', function () {
      it('should return all triples with that graph',
        shouldIncludeAll(store.find(null, null, null, 'http://graphs.org/#g1'),
          ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1', 'http://graphs.org/#g1']));
    });
  });

  describe('An N3Store with the http prefix', function () {
    var store = new N3Store([
      { subject: 'http://foo.org/#s1', predicate: 'http://bar.org/p1', object: 'http://foo.org/#o1' },
      { subject: 'http://foo.org/#s1', predicate: 'http://bar.org/p2', object: 'http://foo.org/#o1' },
      { subject: 'http://foo.org/#s2', predicate: 'http://bar.org/p1', object: 'http://foo.org/#o2' },
    ],
    { prefixes: { http: 'http://www.w3.org/2006/http#' } });

    describe('should allow to query subjects without prefixes', function () {
      it('should return all triples with that subject',
        shouldIncludeAll(store.find('http://foo.org/#s1', null, null),
                         ['http://foo.org/#s1', 'http://bar.org/p1', 'http://foo.org/#o1'],
                         ['http://foo.org/#s1', 'http://bar.org/p2', 'http://foo.org/#o1']));
    });
  });

  describe('An N3Store created without triples but with prefixes', function () {
    var store = new N3Store({ prefixes: { http: 'http://www.w3.org/2006/http#' } });
    store.addTriple('a', 'http://www.w3.org/2006/http#b', 'c').should.be.true;

    describe('should allow to query predicates with prefixes', function () {
      it('should return all triples with that predicate',
        shouldIncludeAll(store.find(null, 'http:b', null),
                         ['a', 'http://www.w3.org/2006/http#b', 'c']));
    });
  });

  describe('An N3Store containing a blank node', function () {
    var store = new N3Store();
    var b1 = store.createBlankNode();
    store.addTriple('s1', 'p1', b1).should.be.true;

    describe('when searched with more than one variable', function () {
      it('should return a triple with the blank node as an object',
        shouldIncludeAll(store.find(),
                         ['s1', 'p1', b1]));
    });

    describe('when searched with one variable', function () {
      it('should return a triple with the blank node as an object',
        shouldIncludeAll(store.find('s1', 'p1'),
                         ['s1', 'p1', b1]));
    });
  });

  describe('An N3Store', function () {
    var store = new N3Store();

    // Test inspired by http://www.devthought.com/2012/01/18/an-object-is-not-a-hash/.
    // The value `__proto__` is not supported however – fixing it introduces too much overhead.
    it('should be able to contain entities with JavaScript object property names', function () {
      store.addTriple('toString', 'valueOf', 'toLocaleString', 'hasOwnProperty').should.be.true;
      shouldIncludeAll(store.find(null, null, null, 'hasOwnProperty'),
                       ['toString', 'valueOf', 'toLocaleString', 'hasOwnProperty'])();
    });

    it('should be able to contain entities named "null"', function () {
      store.addTriple('null', 'null', 'null', 'null').should.be.true;
      shouldIncludeAll(store.find(null, null, null, 'null'), ['null', 'null', 'null', 'null'])();
    });
  });
});

function itShouldBeEmpty(result) {
  it('should be empty', function () {
    if (typeof result === 'function') result = result();
    result.should.be.empty;
  });
}

function shouldIncludeAll(result) {
  var items = Array.prototype.slice.call(arguments, 1).map(function (arg) {
    return { subject: arg[0], predicate: arg[1], object: arg[2], graph: arg[3] || '' };
  });
  return function () {
    if (typeof result === 'function') result = result();
    result.should.have.length(items.length);
    for (var i = 0; i < items.length; i++)
      result.should.include.something.that.deep.equals(items[i]);
  };
}
