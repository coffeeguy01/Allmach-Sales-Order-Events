/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/dialog'],

    function (search, dialog) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {
            //New Business Rule, cant use parent customer in a Sales Order.
            var currentRecord = scriptContext.currentRecord;
            var customerId = currentRecord.getValue({fieldId: 'entity'});

            if (customerId) {
                var customerSearchObj = search.create({
                    type: "customer",
                    filters:
                        [
                            ["subcustomer.entityid", "isnotempty", ""],
                            "AND",
                            ["internalid", "is", customerId]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "entityid",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),

                        ]
                });
                var searchResultCount = customerSearchObj.runPaged().count;
                log.debug("customerSearchObj result count", searchResultCount);

                if (searchResultCount > 0) {

                    var options = {
                        title: 'STOP',
                        message: 'You cant attach parent company to a Sales Order'
                    };
                    dialog.alert(options);
                    currentRecord.setValue({fieldId: 'entity', value: ''});
                    return false;
                }
            }

        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {
            // log.debug('scriptContext.fieldId', scriptContext.fieldId)
            if (scriptContext.fieldId == 'otherrefnum') {
                log.debug('scriptContext.fieldId', scriptContext.fieldId)
                var arrTranId = [];
                var currentRecord = scriptContext.currentRecord;
                var poNumber = currentRecord.getValue({fieldId: 'otherrefnum'});
                if (poNumber) {
                    var salesorderSearchObj = search.create({
                        type: "salesorder",
                        filters:
                            [
                                ["type", "anyof", "SalesOrd"],
                                "AND",
                                ["formulatext: {otherrefnum}", "is", poNumber],
                                "AND",
                                ["mainline", "is", "T"]
                            ],
                        columns:
                            [
                                search.createColumn({name: "tranid", label: "Document Number"})
                            ]
                    });
                    var searchResultCount = salesorderSearchObj.runPaged().count;
                    log.debug("salesorderSearchObj result count", searchResultCount)
                    if (searchResultCount > 0) {
                        salesorderSearchObj.run().each(function (result) {
                            var soNumber = result.getValue({name: "tranid"});
                            arrTranId.push(soNumber);
                            return true;
                        });
                        if (arrTranId.length > 0) {
                            var options = {
                                title: 'STOP',
                                message: 'Possible duplicate entry of PO. Please check if this order has been entered previously. See Transaction: ' + arrTranId[0]
                            };
                            dialog.alert(options);
                        }
                    }
                }
                return true
            } else if (scriptContext.fieldId === 'entity') { //New Business Rule, cant use parent customer in a Sales Order.
                log.debug('scriptContext.fieldId', scriptContext.fieldId)
                var currentRecord = scriptContext.currentRecord;
                var customerId = currentRecord.getValue({fieldId: 'entity'});

                if (customerId) {
                    var customerSearchObj = search.create({
                        type: "customer",
                        filters:
                            [
                                ["subcustomer.entityid", "isnotempty", ""],
                                "AND",
                                ["internalid", "is", customerId]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "entityid",
                                    sort: search.Sort.ASC,
                                    label: "Name"
                                }),

                            ]
                    });
                    var searchResultCount = customerSearchObj.runPaged().count;
                    log.debug("customerSearchObj result count", searchResultCount);

                    if (searchResultCount > 0) {

                        var options = {
                            title: 'STOP',
                            message: 'You cant attach parent company to a Sales Order'
                        };
                        dialog.alert(options);
                        currentRecord.setValue({fieldId: 'entity', value: ''});
                    }
                }
            }
            return true;
        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            if (scriptContext.fieldId == 'custbody_hold_picking') {
                var currentRecord = scriptContext.currentRecord;
                var holdPicking = currentRecord.getValue({fieldId: 'custbody_hold_picking'});
                if (holdPicking) {
                    var fldHoldPicking = currentRecord.getField({
                        fieldId: 'custbodyhold_pikcing_reason'
                    })
                    fldHoldPicking.isMandatory = true;
                } else {
                    var fldHoldPicking = currentRecord.getField({
                        fieldId: 'custbodyhold_pikcing_reason'
                    })
                    fldHoldPicking.isMandatory = false;
                    currentRecord.setValue({fieldId: 'custbodyhold_pikcing_reason', value: ''})
                }

            } else if (scriptContext.fieldId == 'custbodyhold_pikcing_reason') {
                var currentRecord = scriptContext.currentRecord;
                var holdPickingReason = currentRecord.getValue({fieldId: 'custbodyhold_pikcing_reason'});
                if (holdPickingReason) {
                    var fldHoldPickingReason = currentRecord.getField({
                        fieldId: 'custbodyhold_pikcing_reason'
                    })
                    log.debug('has value holdPickingReason'+holdPickingReason)
                    //fldHoldPicking.isMandatory = true;
                } else {
                    var fldHoldPickingReason = currentRecord.getField({
                        fieldId: 'custbodyhold_pikcing_reason'
                    })
                    log.debug('no value holdPickingReason'+holdPickingReason)
                    //fldHoldPicking.isMandatory = false;
                    //currentRecord.setValue({fieldId: 'custbodyhold_pikcing_reason', value: ''})
                }

            }



        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {
            var currentRecord = scriptContext.currentRecord;
            var holdPicking = currentRecord.getValue({fieldId: 'custbody_hold_picking'});
            if (holdPicking) {
                var holdPickingReason = currentRecord.getValue({fieldId: 'custbodyhold_pikcing_reason'});
                if (!holdPickingReason) {
                    alert('Please enter a reason for holding picking')
                    return false
                }
                return true
            }
            return true
        }

        return {
            pageInit: pageInit,
            validateField: validateField,
            fieldChanged: fieldChanged,
            saveRecord: saveRecord

        };

    });
