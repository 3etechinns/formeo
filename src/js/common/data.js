'use strict';
import events from './events';
import helpers from './helpers';

// Object map of fields on the stage
var _data = {},
  dataMap = {
    stage: {},
    rows: {},
    columns: {},
    fields: {}
  };

// Registered fields are the fields that are configured on init. This variable acts as a data buffer
// thats contains the configurations for a field's final view.
var registeredFields = {};

var data = {
  init: (opts, formData) => {
    _data.opts = Object.assign({}, opts);
    let processFormData = (formData) => {
      _data.formData = (typeof formData === 'string') ? window.JSON.parse(formData) : formData;
      console.log(_data.formData);
      _data.formData.id = formData.id || _data.opts.formID || helpers.uuid();
      data.loadMap();
    };

    if (formData) {
      processFormData(formData);
    } else if (window.sessionStorage) {
      formData = window.sessionStorage.getItem('formData');
      if (formData) {
        processFormData(formData);
      } else {
        _data.formData = {};
      }
    } else {
      _data.formData = {};
    }

    _data.formData.id = _data.opts.formID || helpers.uuid();
    _data.opts.formID = _data.formData.id;

    return data;
  },

  saveColumnOrder: (row) => {
    let columns = row.getElementsByClassName('stage-column');
    return dataMap.rows[row.id].columns = helpers.map(columns, (i) => {
      return columns[i].id;
    });
  },

  saveRowOrder: (row) => {
    let rows = row.parentElement.getElementsByClassName('stage-row');
    return dataMap.stage.rows = helpers.map(rows, (rowID) => {
      return rows[rowID].id;
    });
  },

  // getColumnData: (row) => {
  //   let columns = row.getElementsByClassName('stage-column'),
  //     allColumnData = [];
  //   Array.prototype.forEach.call(columns, function(column) {
  //     let columnData = {
  //       id: column.id,
  //       fields: column.getElementsByClassName('stage-field')
  //     };
  //     allColumnData.push(columnData);
  //   });
  //   return allColumnData;
  // },



  /**
   * Converts dataMap into formData Object
   * @return {Object} formData JS Object
   */
  saveMap: (group, id) => {
    let map = {
      rows: () => {
        let rows = dataMap.stage.rows;
        _data.formData.rows = [];

        helpers.forEach(rows, (i, rowID) => {
          console.log(dataMap.rows[rowID].columns);
          _data.formData.rows[i] = Object.assign({}, dataMap.rows[rowID]);
          _data.formData.rows[i].columns = map.columns(rowID);
          console.log(dataMap.rows[rowID].columns);
        });

        return _data.formData.rows;
      },
      columns: (rowID) => {
        let columns = dataMap.rows[rowID].columns,
          rowLink = data.rowLink(rowID);

        helpers.forEach(columns, (i, columnID) => {
          rowLink.columns[i] = Object.assign({}, dataMap.columns[columnID]);
          rowLink.columns[i].fields = map.fields(columnID);
        });

        return rowLink.columns;
      },
      fields: (columnID) => {
        let fields = dataMap.columns[columnID].fields;
        console.log(fields);
        let columnLink = data.columnLink(columnID);

        helpers.forEach(fields, (i, fieldID) => {
          columnLink.fields[i] = Object.assign({}, dataMap.fields[fieldID]);
        });

        return columnLink.fields;
      },
      attrs: (fieldID) => {
        let fieldLink = data.fieldLink(fieldID);
        fieldLink.attrs = dataMap.fields[fieldID].attrs;

        return fieldLink.attrs;
      }
    };

    return map[group](id);
  },

  // Provides a map to a field in formData
  fieldLink: (fieldID) => {
    let field = dataMap.fields[fieldID],
      column = dataMap.columns[field.parent],
      row = dataMap.rows[column.parent],
      fieldIndex = column.fields.indexOf(field.id),
      columnIndex = row.columns.indexOf(column.id),
      rowIndex = dataMap.stage.rows.indexOf(row.id);
    row = _data.formData.rows[rowIndex];
    column = row.columns[columnIndex];
    field = column.fields[fieldIndex];

    return field;
  },

  // Provides a map to a column in formData
  columnLink: (columnID) => {

    let column = dataMap.columns[columnID];
    let row = dataMap.rows[column.parent];
    let columnIndex = row.columns.indexOf(column.id);
    console.log(columnID);
    console.log(column.id);
    console.log(row.columns);
    console.log(columnIndex);
    let rowIndex = dataMap.stage.rows.indexOf(row.id);
    row = _data.formData.rows[rowIndex];
    column = row.columns[columnIndex];

    return column;
  },

  // Provides a map to a row in formData
  rowLink: (rowID) => {
    let rowIndex = dataMap.stage.rows.indexOf(rowID);
    return _data.formData.rows[rowIndex];
  },

  loadMap: () => {
    let map = {
      rows: () => {
        let formData = helpers.copyObj(_data.formData);
        // map column ids to rows
        dataMap.stage.rows = helpers.map(formData.rows, (i) => {
          let formDataRow = formData.rows[i],
            rowID = formDataRow.id;
          dataMap.rows[rowID] = formDataRow;
          map.columns(formDataRow);
          return rowID;
        });
      },
      columns: (formDataRow) => {
        // map column ids to rows
        dataMap.rows[formDataRow.id].columns = helpers.map(formDataRow.columns, (i) => {
          let formDataColumn = formDataRow.columns[i],
            columnID = formDataColumn.id;
          dataMap.columns[columnID] = formDataColumn;
          map.fields(formDataColumn);
          return columnID;
        });
      },
      fields: (formDataColumn) => {
        dataMap.columns[formDataColumn.id].fields = helpers.map(formDataColumn.fields, (i) => {
          let formDataField = formDataColumn.fields[i],
            fieldID = formDataField.id;
          dataMap.fields[fieldID] = formDataField;
          return fieldID;
        });
      }
    };

    map.rows();
  },

  jsonSave: (group, id) => {

    let stage = document.getElementById(_data.formData.id + '-stage');
    data.saveMap(group, id);
    stage.classList.toggle('stage-empty', (dataMap.stage.rows.length === 0));
    return _data.formData;
  },

  save: (group = 'rows', id) => {
    console.log('Saved: ' + group);
    var doSave = {
      // xml: _this.xmlSave,
      json: data.jsonSave
    };

    doSave[_data.opts.dataType](group, id);
    console.log(_data.formData);
    //trigger formSaved event
    document.dispatchEvent(events.formeoUpdate);

    if (window.sessionStorage) {
      window.sessionStorage.setItem('formData', window.JSON.stringify(_data.formData));
    }

    return _data.formData;
  },

  get: () => {
    return _data.formData;
  }
};

events.formeoUpdate = new CustomEvent('formeoUpdate', {
  detail: {
    formData: _data.formData
  }
});

export {
  data,
  dataMap,
  registeredFields
};
