import { HTTP } from 'meteor/http';

import config from '../config/activecampaign';

export default (email, tagType) => {
  const contactRes = HTTP.get(config.apiBase + '/api/3/contacts', {
    headers: {
      'Api-Token': config.apiKey
    },
    params: {
      email
    }
  });

  let contactId;
  if (contactRes && contactRes.data && contactRes.data.contacts && contactRes.data.contacts.length) {
    contactId = contactRes.data.contacts[0].id;
  } else {
    const createRes = HTTP.post(config.apiBase + '/api/3/contacts', {
      data: {
        contact: {
          email
        }
      },
      headers: {
        'Api-Token': config.apiKey
      }
    });
    if (createRes && createRes.data && createRes.data.contact) {
      contactId = createRes.data.contact.id;
    }
  }
  if (contactId) {
    if (config.listId) {
      HTTP.post(config.apiBase + '/api/3/contactLists', {
        data: {
          contactList: {
            contact: contactId,
            list: config.listId,
            status: 1
          }
        },
        headers: {
          'Api-Token': config.apiKey
        }
      });
    }
    HTTP.post(config.apiBase + '/api/3/contactTags', {
      data: {
        contactTag: {
          contact: contactId,
          tag: config.tagIds[tagType]
        }
      },
      headers: {
        'Api-Token': config.apiKey
      }
    });
  }
};
