class CkeditorUploadAdapter {
  constructor( loader ) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file
      .then( file => new Promise( ( resolve, reject ) => {
        const reader = new FileReader();
        const fileType = file.type;
        reader.addEventListener('load', () => {
          const base64 = reader.result.split(',')[1];

          Meteor.call('uploadImage', 'widget', file.type, base64, (err, res) => {
            if (err) {
              reject(err.reason || err.message);
            } else {
              resolve({ default: res.iconUrl });
            }
          });
        }, false);
        reader.readAsDataURL(file);
      } ) );
  }
}

export default CkeditorUploadAdapter;
