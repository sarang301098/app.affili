export default {
  styles: {
    control: (provided, state) => ({
      ...provided,
      fontSize: '1rem',
      fontWeight: 'normal',
    }),
    placeholder: (provided, state) => ({
      ...provided,
      fontSize: '1rem',
      fontWeight: 'normal',
    }),
    noOptionsMessage: (provided, state) => ({
      ...provided,
      fontSize: '1rem',
      fontWeight: 'normal',
    }),
    menu: (provided, state) => ({
      ...provided,
      zIndex: 9,
      fontSize: '1rem',
      fontWeight: 'medium',
    }),
  },
  smallStyles: {
    control: (provided, state) => ({    
      ...provided,
      minHeight: 32,
      height: 32
    }),
    indicatorsContainer: provided => ({
      ...provided,
      height: 32
    }),
    clearIndicator: provided => ({
      ...provided,
      padding: 5
    }),
    dropdownIndicator: provided => ({
      ...provided,
      padding: 5
    })
  },
  theme: theme => ({
    ...theme,
    borderRadius: 4,
    fontSize: '1rem',
    fontWeight: 'normal',
    colors: {
      ...theme.colors,
      primary25: 'rgba(241, 39, 50, .25)',
      primary50: 'rgba(241, 39, 50, .50)',
      primary75: 'rgba(241, 39, 50, .75)',
      primary: '#f12732',
      neutral20: '#ced4da',
      neutral30: '#333',
      neutral40: '#333',
    },
  }),
  themeDark: theme => ({
    ...theme,
    borderRadius: 4,
    fontSize: '1rem',
    fontWeight: 'normal',
    colors: {
      ...theme.colors,
      primary25: 'rgba(241, 39, 50, .25)',
      primary50: 'rgba(241, 39, 50, .50)',
      primary75: 'rgba(241, 39, 50, .75)',
      primary: '#f12732',
      neutral0: '#444',
      neutral10: '#777',
      neutral20: '#555',
      neutral30: '#555',
      neutral80: '#eee'
    },
  }),
};
