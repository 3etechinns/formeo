import Sortable from 'sortablejs';
import i18n from 'mi18n';
import { data, dataMap, registeredFields } from '../common/data';
import helpers from '../common/helpers';
import events from '../common/events';
import DOM from '../common/dom';
import Panels from './panels';
import Row from './row';
import Column from './column';
import Field from './field';
var dom = new DOM();

export class Controls {
  constructor(controlOptions) {
    let defaults = {
      sortable: true,
      controlGroupOrder: [
        'common',
        'html'
      ],
      controlGroups: [{
        id: 'common',
        label: i18n.get('commonFields'),
        order: [
          'text-input',
          'checkbox'
        ]
      }, {
        id: 'html',
        label: i18n.get('htmlElements'),
        order: [
          'header',
          'block-text'
        ]
      }],
      elements: [{
          tag: 'input',
          attrs: {
            type: 'text',
            className: 'form-control'
          },
          config: {
            label: i18n.get('input.text')
          },
          meta: {
            group: 'common',
            icon: 'text-input',
            id: 'text-input'
          },
          fMap: 'attrs.value'
        }, {
          tag: 'input',
          attrs: {
            type: 'date',
            className: 'form-control'
          },
          config: {
            label: i18n.get('input.date')
          },
          meta: {
            group: 'common',
            icon: 'calendar',
            id: 'date-input'
          }
        }

        , {
          tag: 'button',
          attrs: {
            type: 'button',
            className: 'btn-secondary btn'
          },
          content: i18n.get('button'),
          config: {
            label: i18n.get('button'),
            hideLabel: true
          },
          meta: {
            group: 'common',
            icon: 'button',
            id: 'button'
          },
          options: [{
            label: i18n.get('button'),
            value: 'button',
            disabled: false
          }]
        }, {
          tag: 'select',
          className: 'form-control',
          config: {
            label: i18n.get('select')
          },
          attrs: {
            className: 'form-control'
          },
          meta: {
            group: 'common',
            icon: 'select',
            id: 'select'
          },
          options: [{
            label: i18n.get('labelCount', { label: i18n.get('option'), count: 1 }),
            value: 'option-1',
            selected: false
          }, {
            label: i18n.get('labelCount', { label: i18n.get('option'), count: 1 }),
            value: 'option-2',
            selected: false
          }]
        }, {
          tag: 'textarea',
          className: 'form-control',
          config: {
            label: i18n.get('textarea')
          },
          meta: {
            group: 'common',
            icon: 'textarea',
            id: 'textarea'
          },
          attrs: {
            maxlength: 10
          }
        },
        // {
        //   tag: 'canvas',
        //   config: {
        //     label: 'Signature'
        //   },
        //   meta: {
        //     group: 'common',
        //     icon: 'signature',
        //     id: 'signature'
        //   }
        // },
        {
          tag: 'input',
          attrs: {
            type: 'checkbox',
            className: 'form-control'
          },
          config: {
            label: i18n.get('checkbox') + '/' + i18n.get('group'),
            required: true
          },
          meta: {
            group: 'common',
            icon: 'checkbox',
            id: 'checkbox'
          },
          options: [{
            label: i18n.get('labelCount', { label: i18n.get('checkbox'), count: 1 }),
            value: 'checkbox-1',
            selected: true
          }]
        }, {
          tag: 'input',
          attrs: {
            type: 'radio',
            required: false
          },
          config: {
            label: i18n.get('radioGroup')
          },
          meta: {
            group: 'common',
            icon: 'radio-group',
            id: 'radio'
          },
          options: [{
            label: i18n.get('labelCount', { label: i18n.get('checkbox'), count: 1 }),
            value: 'radio-1',
            selected: false
          }, {
            label: i18n.get('labelCount', { label: i18n.get('radio'), count: 2 }),
            value: 'radio-2',
            selected: false
          }]
        }, {
          tag: 'h1',
          config: {
            label: i18n.get('header'),
            hideLabel: true
          },
          meta: {
            group: 'html',
            icon: 'header',
            id: 'header'
          },
          content: i18n.get('header')
        }, {
          tag: 'p',
          config: {
            label: i18n.get('paragraph'),
            hideLabel: true
          },
          meta: {
            group: 'html',
            icon: 'paragraph',
            id: 'paragraph'
          },
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras non nibh massa. Curabitur quis dictum lorem. Quisque ac lacus dignissim, malesuada turpis eget, venenatis nunc. '
        }, {
          tag: 'hr',
          config: {
            label: i18n.get('paragraph'),
            noWrap: true
          },
          meta: {
            group: 'html',
            icon: 'divider',
            id: 'divider'
          }
        }
      ]
    };

    this.opts = Object.assign({}, defaults, controlOptions);
  }

  mergeGroups() {
    let _this = this,
      opts = this.opts,
      groups = this.opts.controlGroups.slice(),
      elements = this.opts.elements.slice(),
      allGroups = [],
      position = {},
      clicked = (x, y) => {
        let xMin = position.x - 5,
          xMax = position.x + 5,
          yMin = position.y - 5,
          yMax = position.y + 5;

        return (helpers.numberBetween(x, xMin, xMax) && helpers.numberBetween(y, yMin, yMax));
      },
      groupControlMap = function(elem) {
        let dataID = helpers.uuid();
        let elementControl = {
          tag: 'li',
          className: 'field-control',
          id: dataID,
          action: {
            mousedown: (evt) => {
              position.x = evt.clientX;
              position.y = evt.clientY;
            },
            mouseup: (evt) => {
              if (clicked(evt.clientX, evt.clientY)) {
                _this.addRow(evt.target.id);
              }
            }
          },
          content: [elem.config.label]
        };

        if (elem.meta.icon) {
          elementControl.content.unshift(dom.icon(elem.meta.icon));
        }

        registeredFields[dataID] = elem;
        return elementControl;
      };

    // Apply order
    groups = helpers.orderObjectsBy(groups, opts.controlGroupOrder, 'id');

    allGroups = helpers.map(groups, (i) => {
      let group = {
        tag: 'ul',
        attrs: {
          className: 'control-group',
          id: opts.formID + '-' + groups[i].id + '-control-group'
        },
        fType: 'controlGroup',
        config: {
          label: groups[i].label || ''
        }
      };

      if (groups[i].order) {
        elements = helpers.orderObjectsBy(elements, groups[i].order, 'meta.id');
      }
      group.content = elements.filter((field) => {
        return field.meta.group === groups[i].id;
      }).map(groupControlMap);

      return group;
    });

    return allGroups;
  }

  clearAll(rows) {
    let stage = rows[0].parentElement;
    stage.classList.add('removing-all-fields');
    // var markEmptyArray = [];

    // if (this.opts.prepend) {
    //   markEmptyArray.push(true);
    // }

    // if (this.opts.append) {
    //   markEmptyArray.push(true);
    // }

    // if (!markEmptyArray.some(elem => elem === true)) {
    // stage.classList.add('stage-empty');
    // }

    var outerHeight = 0;
    helpers.forEach(rows, (i) => {
      outerHeight += rows[i].offsetHeight + 5;
    });

    rows[0].style.marginTop = (-outerHeight) + 'px';
    stage.classList.add('stage-empty');

    setTimeout(function() {
      while (stage.firstChild) {
        stage.removeChild(stage.firstChild);
      }
      stage.classList.remove('removing-all-fields');
      dataMap.stage.rows = [];
      data.save();
    }, 300);
  }

  formActions() {
    let _this = this,
      btnTemplate = {
        tag: 'button'
      },
      clearBtn = Object.assign({}, btnTemplate, {
        content: [dom.icon('bin'), i18n.get('clear')],
        className: ['clear-form'],
        action: {
          click: (evt) => {
            let stage = document.getElementById(_this.opts.formID + '-stage'),
              rows = stage.getElementsByClassName('stage-row'),
              buttonPosition = evt.target.getBoundingClientRect(),
              bodyRect = document.body.getBoundingClientRect(),
              coords = {
                pageX: buttonPosition.left + (buttonPosition.width / 2),
                pageY: (buttonPosition.top - bodyRect.top) - 12
              };

            if (rows.length) {
              events.confirmClearAll = new CustomEvent('confirmClearAll', {
                detail: {
                  confirmationMessage: i18n.get('confirmClearAll'),
                  clearAllAction: _this.clearAll,
                  btnCoords: coords,
                  rows: rows
                }
              });
              document.dispatchEvent(events.confirmClearAll);

            } else {
              alert('There are no fields to clear');
            }
          }
        }
      }),
      settingsBtn = Object.assign({}, btnTemplate, {
        content: [dom.icon('settings'), i18n.get('settings')],
        attrs: { title: i18n.get('settings') },
        className: ['edit-settings']
      }),
      saveBtn = Object.assign({}, btnTemplate, {
        content: [dom.icon('floppy-disk'), i18n.get('save')],
        className: ['save-form']
      }),
      formActions = {
        tag: 'div',
        className: 'form-actions',
        content: [clearBtn, settingsBtn, saveBtn]
      };

    for (var i = formActions.content.length - 1; i >= 0; i--) {
      formActions.content[i].className.push('btn', 'btn-secondary');
    }

    return formActions;
  }

  /**
   * Returns the markup for the form controls/fields
   * @return {DOM}
   */
  get dom() {
    if (this.controls) {
      return this.controls;
    }

    // let controlNavElements = this.controlNavElements(), // Navigation for all the form elements
    //   groupedFields = dom.create(this.mergeGroups()), // grouped form and html elements
    let groupedFields = this.mergeGroups();
    let formActions = this.formActions();
    let controlPanels = new Panels({ panels: groupedFields, type: 'controls' });
    this.controlGroupsWrap = dom.create({
      tag: 'div',
      className: 'control-groups panels-wrap panel-count-' + groupedFields.length,
      content: controlPanels
    });
    let controls = dom.create({
        tag: 'div',
        className: this.opts.className + '-controls',
        content: [this.controlGroupsWrap, formActions]
      }),
      controlGroups = controls.getElementsByClassName('control-group');

    this.controls = controls;
    this.controlGroups = controlGroups;
    this.currentGroup = controlGroups[0];

    // Make controls sortable
    for (var i = controlGroups.length - 1; i >= 0; i--) {
      Sortable.create(controlGroups[i], {
        animation: 150,
        forceFallback: true,
        ghostClass: 'control-ghost',
        group: { name: 'controls', pull: 'clone', put: false },
        sort: this.opts.sortable
      });
    }

    return controls;
  }

  createColumn(id) {
    let field = new Field(id),
      column = new Column();

    dataMap.fields[field.id].parent = column.id;

    field.classList.add('first-field');
    column.appendChild(field);
    dataMap.columns[column.id].fields.push(field.id);
    return column;
  }

  addRow(id) {
    let _this = this,
      stageID = _this.opts.formID + '-stage',
      stage = document.getElementById(stageID),
      column = _this.createColumn(id),
      row = new Row();

    // Set parent IDs
    dataMap.columns[column.id].parent = row.id;
    dataMap.rows[row.id].parent = stageID;
    row.appendChild(column);
    data.saveColumnOrder(row);
    stage.appendChild(row);
    data.saveRowOrder(row);
    data.save();
  }

}
