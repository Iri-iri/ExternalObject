({
    onLWCEvent: function (component, event) {
        var createRecordEvent = $A.get("e.force:createRecord");
        var recordId = component.get("v.recordId");
        createRecordEvent.setParams({
            "entityApiName": "ExternalItem__c",
            "defaultFieldValues": {
                'ParentId__c': recordId,
                'Name': 'Item',
            }
        })
        createRecordEvent.fire();
    },

    onLWCEventUpdate: function (component, event) {
        var editRecordEvent = $A.get("e.force:editRecord");
        var itemId = event.getParam('idToEdit');
        editRecordEvent.setParams({
            "entityApiName": "ExternalItem__c",
            "recordId": itemId
        });
        editRecordEvent.fire();
    },

    onShowToastEvent: function (component, event) {
        if (event.getParam('messageTemplateData')[0] === 'ExternalItem') {
            if (event.getParam('message').includes( 'was saved') || event.getParam('message').includes('was created')) {
                var nestedComponent = component.find('nestedComponent');
                nestedComponent.displayRecordsPerPage();
            }
        }
    }
});