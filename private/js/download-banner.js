function fadeOut(el) {
  if (!el) {
    return;
  }

  el.style.opacity = 1;

  (function fade() {
    if ((el.style.opacity -= .1) < 0) {
      el.style.display = 'none';
    } else {
      requestAnimationFrame(fade);
    }
  })();
}

function fadeIn(el, ms, display, callback) {
  if (!el) {
    return;
  }

  el.style.opacity = 0;
  el.style.display = display || 'flex';

  (function fade() {
    var val = parseFloat(el.style.opacity);
    if (!((val += .1) > 1)) {
      el.style.opacity = val;
      requestAnimationFrame(fade);
    } else if (typeof callback === 'function') {
      callback();
    }
  })();
}


if (bannerConfig) {
  var notification = document.createElement('div');
  notification.className = 'convertapp-download-banner';
  notification.style.alignItems = 'center';
  notification.style.position = 'fixed';
  notification.style.zIndex = '999';
  notification.style.left = '15px';
  notification.style.bottom = '15px';
  notification.style.maxWidth = '100%';
  notification.style.width = 'calc(100% - 30px)';
  notification.style.fontFamily = 'sans-serif';
  notification.style.fontSize = '13px';
  notification.style.display = 'none';
  notification.style.cursor = 'pointer';

  var content = document.createElement('div');
  content.style.borderRadius = '8px';
  content.style.display = 'flex';
  content.style.alignItems = 'center';
  content.style.width = '100%';
  content.style.marginLeft = 'auto';
  content.style.padding = '10px 15px';
  content.style.boxSizing = 'border-box';
  content.style.backgroundColor = (bannerConfig.style || {}).backgroundColor || '#fff';
  content.style.color = (bannerConfig.style || {}).color || '#333';
  content.style.boxShadow = '1px 2px 8px rgba(0,0,0,0.2)';

  var image = document.createElement('div');
  image.style.backgroundImage = 'url(' + bannerConfig.iconUrl + ')';
  image.style.backgroundRepeat = 'no-repeat';
  image.style.backgroundPosition = 'center';
  image.style.backgroundSize = 'cover';
  image.style.borderRadius = '100px';
  image.style.width = '35px';
  image.style.height = '35px';
  image.style.marginRight = '15px';
  image.style.borderRadius = '6px';

  content.appendChild(image);

  var contentText = document.createElement('div');
  contentText.innerHTML = bannerConfig.text || '';
  contentText.style.fontSize = '16px';
  contentText.style.marginRight = 'auto';

  content.appendChild(contentText);

  notification.appendChild(content);

  var closer = document.createElement('button');
  closer.style.backgroundColor = 'transparent';
  closer.style.border = 'none';
  closer.style.position = 'absolute';
  closer.style.top = '10px';
  closer.style.right = '10px';
  closer.style.cursor = 'pointer';
  closer.innerHTML = '&times;';
  closer.style.opacity = '0.75';
  closer.style.color = (bannerConfig.style || {}).color || '#999';
  closer.style.top = '10px';
  closer.addEventListener('click', function (e) {
    e.preventDefault();
    if (notification && !bannerConfig.closing) {
      bannerConfig.closing = true;
      fadeOut(notification, 100);
    }
  });
  notification.appendChild(closer);

  var isAndroid = /android/i.test(navigator.userAgent);
  var isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Version)/i.test(navigator.userAgent);
  var isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !isWebView;

  if (isAndroid || isIos || bannerConfig.preview) {
    document.body.appendChild(notification);

    notification.addEventListener('click', function(e) {
      e.preventDefault();

      var url = 'about:blank';
      if (isIos && bannerConfig.appstoreUrl) {
        url = bannerConfig.appstoreUrl;
      }
      if (isAndroid && bannerConfig.playstoreUrl) {
        url = bannerConfig.playstoreUrl;
      }

      window.open(url);
    });

    fadeIn(notification, 300, 'flex');
  }
}
