<template>
    <a-typography-title>{{employee}}'s Receipts</a-typography-title>
        <a-space direction="vertical">
            <a-typography-text type="secondary">Here you can view employee receipts</a-typography-text>
        </a-space>
        
        <a-table :columns="columnsReceipt" :data-source="receiptData">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <span>
                        <a @click="viewReceipt(record)">View Receipt</a>
                    </span>
                </template>
            </template>
        </a-table>

        <a-modal v-model:visible="visible" title="Receipt Details" @ok="handleOk">
            <img :src="sourceFile"/>
        </a-modal>
</template>

<script setup>
    const receiptData = ref([])
    const visible = ref(false)
    const employee = ref("Employee")
    const sourceFile = ref("")
    
    const columnsReceipt = ref([
        {
            title: "Receipt",
            dataIndex: 'name',
            key: 'name'
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
        console.log("updating receipts")
        requestReceiptData(newValue.account_id)
        employee.value = newValue.username
    })

    const requestReceiptData = async (userid) => {
        //FUNCTIONAL REQUIREMENT 9: View Personal Receipt
        const {data: receipt, pending: rpending, error: rerror, refresh: refresh3} = await useAsyncData('receipt', () => $fetch('/server-api/view_uploads?file_type=1&other_user=' + userid), {initialCache: false})

        console.log(receipt.value)
        if (receipt.value.result == "success") {
            receiptData.value = JSON.parse(receipt.value.message)
        }
    }

    const viewReceipt = (record) => {
        var source = "/server-api/view_uploads_single?file_name=" + record.name
        console.log(source)
        sourceFile.value = source
        visible.value = true
    }

    const handleOk = (e) => {
      visible.value = false
    }
</script>
