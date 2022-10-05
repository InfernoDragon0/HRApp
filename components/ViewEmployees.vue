<template>
    <div>
        <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane key="1" tab="Payrolls">
                <ViewPayroll :user="userId"/>
            </a-tab-pane>

            <a-tab-pane key="2" tab="Medical Certificates" force-render>
                <ViewMC :user="userId"/>
            </a-tab-pane>
            <a-tab-pane key="3" tab="Receipts">
                <ViewReceipts :user="userId"/>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup>
// FUNCTIONAL REQUIREMENT 3: Viewing of Employee’s payroll
//FUNCTIONAL REQUIREMENT 4: Editing of Employee’s payroll
// FUNCTIONAL REQUIREMENT 7: Viewing of Employees Medical Certificate
// FUNCTIONAL REQUIREMENT 10: Viewing of Employees Receipts
// FUNCTIONAL REQUIREMENT 12: Downloading of Other Employees’ Payroll

    const activeKey = ref("1")
    const userId = ref("1")

    const props = defineProps(["userid"])
    watch(() => props.userid, (newValue, oldValue) => {
        userId.value = newValue
    })
 

</script>