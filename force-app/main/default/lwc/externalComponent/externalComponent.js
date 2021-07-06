import {LightningElement, api, wire, track} from 'lwc';
import getItemsList from '@salesforce/apex/ExternalObj.getItemsList';
import getCount from '@salesforce/apex/ExternalObj.getCount';
// import getUncreatedRecords from '@salesforce/apex/ExternalObj.getUncreatedRecords';
// import getUneditedRecords from '@salesforce/apex/ExternalObj.getUneditedRecords';
import getInitParams from '@salesforce/apex/ExternalObj.getInitParams';


import {deleteRecord} from 'lightning/uiRecordApi';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

const actions = [
    {label: 'Edit', name: 'edit'},
    {label: 'Delete', name: 'delete'},
];

const DEFAULT_COLUMNS = [
    {label: 'Name', fieldName: 'Name', type: 'string'},
    {label: 'AutoName', fieldName: 'Name__c', type: 'number', sortable: "true"},
    {label: 'Text', fieldName: 'Text__c', type: 'string'},
    {label: 'CreatedDate', fieldName: 'CreatedDate', type: 'date'},
];


export default class ExternalComponent extends LightningElement {

    @api recordId;

    data = [];
    error;

    page = 1;
    @api limit = 5;
    @api amount;
    totalPage = 1;

    idToDelete;

    isLoading = false;

    @track sortedBy;
    @track sortDirection;

    @track isNewBtnOpen = true;
    @track isModalOpen = false;

    get columns() {

        const result = [...DEFAULT_COLUMNS];
        const action = [];

        if (this.isEditButtonShow === true) {
            action.push({label: 'Edit', name: 'edit'});
        }

        if (this.isDeleteButtonShow === true) {
            action.push({label: 'Delete', name: 'delete'});
        }

        if (action.length > 0) {
            result.push({
                label: 'Actions',
                type: 'action',
                typeAttributes: {
                    rowActions: action
                }
            });
        }

        return result;
    }

    connectedCallback() {
        this.displayRecordsPerPage();
        this.checkParams();
        // this.closeNewBtn();
        // this.closeColumnsForActions();
    }

    get isPrevButtonDisabled() {
        return this.page === 1;
    }

    get isNextButtonDisabled() {
        return this.page === this.totalPage;
    }


    get totalCount() {
        return `External Items (${this.amount})`;
    }

    get currentPage() {
        return `${this.page} / ${this.totalPage}`;
    }


    // @wire(getCount, {parentId: '$recordId'})
    // wiredItems({error, data}) {
    //     if (data) {
    //         this.amount = data;
    //         this.totalPage = Math.ceil(this.amount / this.limit);
    //         this.error = undefined;
    //     } else if (error) {
    //         this.error = error;
    //         this.amount = 0;
    //     }
    // }

    getAmountFromApex() {
        getCount({parentId: this.recordId}).then((result) => {
            this.amount = result;
            this.totalPage = Math.ceil(this.amount / this.limit);
            this.error = undefined;
        }).catch((error) => {
            this.error = error;
            this.data = undefined;
        });
    }

    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1;
            this.displayRecordsPerPage();
        }
    }

    nextHandler() {
        if (this.page < this.totalPage) {
            this.page = this.page + 1;
            this.displayRecordsPerPage();
        }
    }

    @api displayRecordsPerPage() {
        this.isLoading = true;
        getItemsList({page: this.page, recordsCount: this.limit, parentId: this.recordId}).then((result) => {
            this.data = result;
            this.getAmountFromApex();
            this.error = undefined;
        }).catch((error) => {
            this.error = error;
            this.data = undefined;
        }).finally(() => {
            this.isLoading = false;
        });
    };


    createRecord() {
        this.dispatchEvent(new CustomEvent('createrecord'))
    }


    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'edit':
                this.editRow(row.Id);
                break;
            case 'delete':
                this.idToDelete = row.Id;
                this.openModal();
                break;
        }
    };

    editRow(idToEdit) {
        this.dispatchEvent(new CustomEvent('updaterecord', {
            detail: {idToEdit},
        }));
    }


    deleteRow(idToDelete) {
        deleteRecord(idToDelete)
            .then(() => {
                this.amount = this.amount - 1;
                this.totalPage = Math.ceil(this.amount / this.limit);
                if (this.page > this.totalPage) {
                    this.page = this.totalPage;
                }
                this.displayRecordsPerPage();
                this.getAmountFromApex();

                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         title: 'Success',
                //         message: 'Record deleted',
                //         variant: 'success'
                //     })
                // );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }


    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    submitModal() {
        this.isModalOpen = false;
        this.deleteRow(this.idToDelete);
    }

    // closeNewBtn() {
    //     getUncreatedRecords().then((result) => {
    //         if (!result) {
    //             this.isNewBtnOpen = false;
    //         }
    //     }).catch((error) => {
    //         this.error = error
    //     });
    // }
    //
    // closeColumnsForActions() {
    //     getUneditedRecords().then((result) => {
    //         if (!result) {
    //             this.columns = columnsWithoutActions;
    //         }
    //     }).catch((error) => {
    //         this.error = error
    //     });
    // }

    checkParams() {
        getInitParams().then((result) => {
            this.isNewButtonShow = result.isNewButtonShow;
            this.isEditButtonShow = result.isEditButtonShow;
            this.isDeleteButtonShow = result.isDeleteButtonShow;

            return result;
        }).catch((error) => {
            this.error = error
        });
    }


    handleSort(event) {
        this.sortedBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortedBy, this.sortDirection);
    }

    sortData(fieldName, direction) {
        getItemsListAll({parentId: this.recordId}).then((result) => {

            let parseData = JSON.parse(JSON.stringify(result));

            let fieldNameValue = (item) => {
                return item[fieldName];
            };

            let isReverseDirection = (direction === 'asc') ? 1 : -1;

            parseData.sort((x, y) => {
                x = fieldNameValue(x) ? fieldNameValue(x) : '';
                y = fieldNameValue(y) ? fieldNameValue(y) : '';

                return isReverseDirection * ((x > y) - (y > x));
            });
            debugger

            this.data = parseData.slice(((this.page - 1) * 5), this.page * 5);
        }).catch((error) => {
            this.error = error;
        });
    }

}