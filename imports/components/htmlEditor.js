import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Editor } from '@tinymce/tinymce-react';
import debounce from 'lodash/debounce';

import Loader from './loader';
import Alert from 'react-s-alert';

class HtmlEditor extends Component {
  constructor(props) {
    super(props);

    this.id = Random.id();

    this.state = {
      focused: false,
      hasError: false,
      content: props.content || '',
      showEditor: true
    };

    this.previousContent = props.content;

    this.throttledOnChange = debounce((content) => {
      if (this.mounted) {
        props.onChange(content);
        this.previousContent = content;
      }
    }, 500);
  }

  componentDidMount() {
    this.mounted = true;

    this.setState({
      offline: typeof navigator.onLine === 'boolean' && !navigator.onLine
    });

    if (Meteor.isClient) {
      window.addEventListener('online', () => this.setState({ offline: false }), false);
      window.addEventListener('offline', () => this.setState({ offline: true }), false);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (!this.state.focused && (nextProps.content !== this.state.content && nextProps.content !== this.content && nextProps.content !== this.previousContent)) {
      this.setState({ content: nextProps.content });
    }
    if (nextProps.id !== this.props.id) {
      this.setState({ showEditor: false }, () => this.setState({ showEditor: true }));
    }

    if (nextProps.hideFontSize !== this.props.hideFontSize) {
      this.setState({ showEditor: false }, () => this.setState({ showEditor: true }));
    }
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
  }

  onChange(content) {
    this.content = content;
    this.setState({ content });
    if (this.throttledOnChange && content !== this.props.content) {
      this.throttledOnChange(content);
    }
  }

  lightOrDark(color) {
    // Variables for red, green, blue values
    var r, g, b, hsp;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {

      // If RGB --> store the red, green, blue values in separate variables
      color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

      r = color[1];
      g = color[2];
      b = color[3];
    }
    else {

      // If hex --> Convert it to RGB: http://gist.github.com/983661
      color = +("0x" + color.slice(1).replace(
        color.length < 5 && /./g, '$&$&'));

      r = color >> 16;
      g = color >> 8 & 255;
      b = color & 255;
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
      0.299 * (r * r) +
      0.587 * (g * g) +
      0.114 * (b * b)
    );

    // Using the HSP value, determine whether the color is light or dark
    if (hsp > 127.5) {

      return 'light';
    }
    else {

      return 'dark';
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h3>Es ist ein unerwarteter Fehler aufgetreten.</h3>
          <p>Bitte speichere einmal ab und lade diese Seite dann neu.</p>
        </div>
      );
    }

    const self = this;

    const editorProps = Object.assign({}, this.props, {
      init: Object.assign({
        entity_encoding: 'raw',
        setup: (editor) => {
          this.editor = editor;

          editor.on('blur', () => {
            this.setState({ focused: false });
          });

          editor.on('focus', () => {
            this.setState({ focused: true });
          });
        },
        convert_urls: false,
        browser_spellcheck: true,
        plugins: [
          'autoresize advlist autolink lists link image charmap print preview hr anchor pagebreak',
          'searchreplace wordcount visualblocks visualchars code',
          'insertdatetime media nonbreaking save table contextmenu directionality',
          'emoticons template paste textcolor colorpicker textpattern toc media'
        ],
        // paste_as_text: true,
        autoresize_max_height: typeof window !== 'undefined' ? window.innerHeight - 300 : 600,
        toolbar1: 'insertfile undo redo | styleselect | bold italic underline strikethrough' + (!this.props.hideFontSize ? ' | fontsizeselect' : '') + ' | removeformat | forecolor backcolor textshadow | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code',
        fontsize_formats: '6px 8px 10px 12px 14px 16px 18px 20px 22px 24px 26px 28px 36px 48px 56px 72px 86px 128px',
        image_advtab: true,
        image_title: true,
        image_caption: true,
        rel_list: [
          { title: 'Ohne', value: '' },
          { title: 'No Follow', value: 'nofollow' },
          { title: 'Follow', value: 'follow' }
        ],
        language: 'de'.substr(0, 2),
        language_url: Meteor.absoluteUrl('js/tinymce/langs/' + 'de'.substr(0, 2) + '.js')
      }, this.props.config)
    });
    delete editorProps.onChange;

    let editor = null;
    if (this.state.showEditor) {
      editor = (
        <Editor
          tinymceScriptSrc={Meteor.absoluteUrl('js/tinymce/tinymce.min.js')}
          value={this.state.content}
          onEditorChange={content => this.onChange(content)}
          {...editorProps}
        />
      );
    }

    return (
      <Loader loaded>
        {editor}
      </Loader>
    );
  }
}

HtmlEditor.propTypes = {
  initCallback: PropTypes.func
};

export default HtmlEditor;
