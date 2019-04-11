const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const Store = require('../lib/Store');

describe('Store', () => {
  let store = null;

  beforeAll(done => {
    mkdirp('./testData/store', done);
  });

  beforeEach(() => {
    store = new Store('./testData/store');
  });

  beforeEach(() => {
    return store.drop();
  });

  afterAll(done => {
    rimraf('./testData', done);
  });

  it('creates an object in my store', () => {
    return store.create({ name: 'Mal' })
      .then(createdPerson => {
        expect(createdPerson).toEqual({ name: 'Mal', _id: expect.any(String) });
      });
  });

  it('finds an object by id', () => {
    return store.create({ name: 'uncle bob' })
      .then(createdUncle => {
        return Promise.all([
          Promise.resolve(createdUncle),
          store.findById(createdUncle._id)
        ]);
      })
      .then(([createdUncle, foundUncle]) => {
        expect(foundUncle).toEqual(createdUncle);
      });
  });

  it('find all objects tracked by the store', () => {
    const undefinedArray = [...Array(5)];
    const arrayOfItems = undefinedArray.map((_, index) => {
      return {
        item: index 
      };
    });
    const createPromises = arrayOfItems
      .map(item => store.create(item));

    return Promise.all(createPromises)
      .then(items => {
        return Promise.all([
          Promise.resolve(items),
          store.find()
        ]);
      })
      .then(([items, foundItems]) => {
        const [item1, item2, item3, item4, item5] = items;
        expect(foundItems).toHaveLength(5);
        expect(foundItems).toContainEqual(item1);
        expect(foundItems).toContainEqual(item2);
        expect(foundItems).toContainEqual(item1);
        expect(foundItems).toContainEqual(item3);
        expect(foundItems).toContainEqual(item4);
        expect(foundItems).toContainEqual(item5);
      });
  });

  it('deletes an object with an id', () => {
    return store.create({ item: 'I am going to delete' })
      .then(createdItem => {
        return Promise.all([
          Promise.resolve(createdItem),
          store.findByIdAndDelete(createdItem._id)
        ]);
      })
      .then(([createdItem, deleteResult]) => {
        expect(deleteResult).toEqual({ deleted: 1 });
        return store.findById(createdItem._id);
      })
      .catch(err => {
        expect(err).toBeTruthy();
      });
  });

  it('updates an existing object', () => {
    return store.create({ name: 'lam' })
      .then(createdItem => {
        return store.findByAndUpdate(createdItem._id, {
          name: 'Mal'
        });
      })
      .then(updatedItem => {
        expect(updatedItem.name).toEqual('Mal');
      });
  });
});
