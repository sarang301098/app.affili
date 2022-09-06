import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

const apiEndpoint = 'http://api.klick-tipp.com';

const postSync = Meteor.wrapAsync(HTTP.post, HTTP);
const getSync = Meteor.wrapAsync(HTTP.get, HTTP);

export default {
  addSubscriber(apikey, email, fields) {
   return postSync(apiEndpoint + '/subscriber/signin', {
      params: {
        apikey,
        email,
        fields
      },
      headers: {
        Accept: 'application/json'
      },
      timeout: 10 * 1000
    });
  },
  login(username, password) {
    const res = postSync(apiEndpoint + '/account/login', {
      params: {
        username,
        password
      },
      headers: {
        Accept: 'application/json'
      },
      timeout: 10 * 1000
    });
    // console.log('KLICKTIPP LOGIN RES:');
    // console.log(res);
    if (res && res.data && res.data.session_name && res.data.sessid) {
      return { name: res.data.session_name, id: res.data.sessid };
    }
    return null;
  },
  getTags(session) {
    const res = getSync(apiEndpoint + '/tag', {
      headers: {
        Accept: 'application/json',
        Cookie: session.name + '=' + session.id
      },
      timeout: 10 * 1000
    });
    // console.log(res);
    if (res.data) {
      return Object.keys(res.data).map((tagId) => ({ id: tagId, name: res.data[tagId] }));
    }
    return null;
  },
  createTag(session, name) {
    return postSync(apiEndpoint + '/tag', {
      params: {
        name
      },
      headers: {
        Accept: 'application/json',
        Cookie: session.name + '=' + session.id
      },
      timeout: 10 * 1000
    });
  },
  tagSubscriber(session, email, tagid) {
    return postSync(apiEndpoint + '/subscriber', {
      params: {
        email,
        tagid
      },
      headers: {
        Accept: 'application/json',
        Cookie: session.name + '=' + session.id
      },
      timeout: 10 * 1000
    });
  },
  untagSubscriber(session, email, tagid) {
    return postSync(apiEndpoint + '/subscriber/untag', {
      params: {
        email,
        tagid
      },
      headers: {
        Accept: 'application/json',
        Cookie: session.name + '=' + session.id
      },
      timeout: 10 * 1000
    });
  }
};
