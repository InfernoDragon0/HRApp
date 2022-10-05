<template>
    <div>
        <a-typography-title>{{employee}}'s Payrolls</a-typography-title>
            <a-typography-text type="secondary">Here you can view payrolls, edit, download them</a-typography-text>
            <a-table :columns="columns" :data-source="payrollData">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'action'">
                        <span>
                            <a @click="viewPayrollSingle(record)">View</a>
                            <a-divider type="vertical" />
                            <a @click="downloadPayroll(record)">Download</a>
                            <a-divider type="vertical" />
                            <a @click="viewPayrollEdit(record)">Edit</a>
                        </span>
                    </template>
                </template>
            </a-table>

            <a-modal v-model:visible="visible" :title="modalType" @ok="handleOk">
                <template v-if="modalType === 'Payroll Details'">
                    <p>ID: {{selectedPayroll.payroll_id}}</p>
                    <p>Amount Received: {{selectedPayroll.amount}}</p>
                    <p>Date submitted: {{selectedPayroll.datetime}}</p>
                </template>
            </a-modal>

            <a-modal v-model:visible="visible2" title="Edit Payroll" @ok="editPayroll">
                <p>Editing for ID: {{selectedPayroll.payroll_id}}</p>
                <p>Current Amount: {{selectedPayroll.amount}}</p>
                <a-form-item label="Payroll Account">
                    <a-input-number v-model:value="payrollEdit" placeholder="new amount" />
                </a-form-item>
            </a-modal>
    </div>
</template>


<script setup>
    const payrollData = ref([])
    const modalType = ref("Payroll Details")
    const selectedPayroll = ref({})
    const visible = ref(false)
    const visible2 = ref(false)
    const employee = ref("Employee")
    const payrollEdit = ref("")

    const columns = ref([
        {
            title: 'Payroll',
            dataIndex: 'payroll_id',
            key: 'payroll_id',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: 'Date',
            dataIndex: 'datetime',
            key: 'datetime',
        },
        {
            title: 'Actions',
            key: 'action',
        },
    ])

    const props = defineProps(["user"])

    watch(() => props.user, (newValue, oldValue) => {
        console.log("updating payroll")
        getPayrollData(newValue.account_id)
        employee.value = newValue.username
    })

    onMounted(async () => {
    })
    

    const getPayrollData = async (userid) => {
        const {data: payrolle, pending, error, refresh} = await useAsyncData('payrolle', () => $fetch('/server-api/view_payroll_all?other_user=' + userid))
        await refresh()

        if (payrolle.value.result == "success") {
            payrollData.value = JSON.parse(payrolle.value.message)
        }
        else {
            console.log(payrolle.value)
        }
    }

    const downloadPayroll = async (record) => { //vanilla HTML time
        var element = document.createElement('a');
        element.setAttribute('href', '/server-api/download_payroll?payroll_id=' + record.payroll_id + "&other_user=" + record.account_id); //TODO: sanitize later?

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

    }

    const handleOk = (e) => {
      visible.value = false
    }

    const editPayroll = async (e) => {
        visible2.value = false

        if (payrollEdit.value.length == 0) {
            return
        }
        
        const {data: payrolledit, pending, error, refresh} = await useAsyncData('payrolledit', () => 
        $fetch('/server-api/edit_payroll', {
            method: 'POST',
            body: {
                other_user: selectedPayroll.value.account_id,
                new_amount: payrollEdit.value,
                payroll_id: selectedPayroll.value.payroll_id
            }
        }), 
        {initialCache: false})

        console.log(payrolledit.value)
        getPayrollData(selectedPayroll.value.account_id)


    }

    const viewPayrollSingle = (record) => {
      visible.value = true
      modalType.value = "Payroll Details"
      selectedPayroll.value = record
    }

    const viewPayrollEdit = (record) => {
      visible2.value = true
      selectedPayroll.value = record
    }
</script>