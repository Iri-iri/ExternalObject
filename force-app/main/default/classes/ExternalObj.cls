public with sharing class ExternalObj {
    @AuraEnabled
    public static List<ExternalItem__c> getItemsList(Id parentId, Integer recordsCount, Integer page) {
        Integer offset = recordsCount * page - recordsCount;
        return [
                SELECT Id, Name, Name__c, ParentId__c, Text__c, Date__c, CreatedDate
                FROM ExternalItem__c
                WHERE ParentId__c = :parentId
                WITH SECURITY_ENFORCED
                LIMIT :recordsCount
                OFFSET :offset
        ];
    }

    @AuraEnabled
    public static Integer getCount(Id parentId) {
        return [
                SELECT COUNT()
                FROM ExternalItem__c
                WHERE ParentId__c = :parentId
                WITH SECURITY_ENFORCED
        ];
    }


//    @AuraEnabled
//    public static Boolean getUncreatedRecords() {
//        Boolean recordIsCreate = true;
//        if (!Schema.sObjectType.ExternalItem__c.isCreateable()) {
//            recordIsCreate = false;
//        }
//        return recordIsCreate;
//    }
//
//
//    @AuraEnabled
//    public static Boolean getUneditedRecords() {
//        Boolean recordIsEdit = true;
//        if (!Schema.sObjectType.ExternalItem__c.isDeletable() || !Schema.sObjectType.ExternalItem__c.isUpdateable()) {
//            recordIsEdit = false;
//        }
//        return recordIsEdit;
//    }

    @AuraEnabled
    public static Map<String, Object> getInitParams() {
        return new Map<String, Object>{
                'isNewButtonShow' => Schema.sObjectType.ExternalItem__c.isCreateable(),
                'isEditButtonShow' => Schema.sObjectType.ExternalItem__c.isUpdateable(),
                'isDeleteButtonShow' => Schema.sObjectType.ExternalItem__c.isDeletable()
        };
    }
//
//    @AuraEnabled
//    public static List<ExternalItem__c> getItemsListAll(Id parentId) {
//        return [
//                SELECT Id, Name, Name__c, ParentId__c, Text__c, Date__c, CreatedDate
//                FROM ExternalItem__c
//                WHERE ParentId__c = :parentId
//                WITH SECURITY_ENFORCED
//        ];
//    }


}