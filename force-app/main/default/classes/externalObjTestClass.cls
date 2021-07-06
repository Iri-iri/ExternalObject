@IsTest class ExternalObjTest {

    @IsTest
    static void testGetItemList() {

        List<Account> listOfAccs = new List<Account>();

        Account Acc1 = new Account(Name = 'Account1');
        listOfAccs.add(Acc1);

        Account Acc2 = new Account(Name = 'Account2');
        listOfAccs.add(Acc2);

        insert listOfAccs;


        List<ExternalItem__c> listOfExtItems = new List<ExternalItem__c>();
        ExternalItem__c Item1 = new ExternalItem__c(ParentId__c = Acc1.Id);
        listOfExtItems.add(Item1);

        ExternalItem__c Item2 = new ExternalItem__c(ParentId__c = Acc1.Id);
        listOfExtItems.add(Item2);

        ExternalItem__c Item3 = new ExternalItem__c(ParentId__c = Acc2.Id);
        listOfExtItems.add(Item3);

        ExternalItem__c Item4 = new ExternalItem__c(ParentId__c = Acc1.Id);
        listOfExtItems.add(Item4);

        insert listOfExtItems;


        Integer countOfSuitableItemsFromList = (ExternalObj.getItemsList(Acc1.Id, 5, 1)).size();
        Integer countOfSuitableItems = ExternalObj.getCount(Acc1.Id);

        Map<String, Object> fakeMapOfInitParams = new Map<String, Object>();
        fakeMapOfInitParams.put('isNewButtonShow', true);
        fakeMapOfInitParams.put('isEditButtonShow', true);
        fakeMapOfInitParams.put('isDeleteButtonShow', true);

        Map<String, Object> mapOfInitParams = ExternalObj.getInitParams();

//        create fake user with Profile or Permission Set
//        System.runAs()


        System.assertEquals(3, countOfSuitableItemsFromList);
        System.assertEquals(3, countOfSuitableItems);
        System.assertEquals(fakeMapOfInitParams, mapOfInitParams);

    }
}