<template>
    <div>
        

    <a-tabs v-model:activeKey="activeKey">


    <a-tab-pane key="1" tab="Payrolls">
        <ViewPayroll :user="userId"/>
    </a-tab-pane>


    <a-tab-pane key="2" tab="Medical Certificates" force-render>
        <a-typography-title>Employee's Medical Certificates</a-typography-title>
        <a-space direction="vertical">
            <a-typography-text type="secondary">Here you can view your medical certificates, and upload new ones</a-typography-text>
                <a-upload
                    v-model:file-list="mcFileList"
                    name="file_data"
                    :before-upload="beforeUpload"
                    accept=".png,.jpg,.jpeg"
                    action="/server-api/upload/0"
                    @change="handleChange"
                >
                    <a-button><upload-outlined/> Upload MC </a-button>
                </a-upload>
                

        </a-space>
        <a-table :columns="columnsMc" :data-source="mcData">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <span>
                        <a @click="viewMedicalCertificate(record)">View MC</a>
                    </span>
                </template>
            </template>
        </a-table>
    </a-tab-pane>


    <a-tab-pane key="3" tab="Receipts">
        <a-typography-title>Your Receipts</a-typography-title>
        <a-space direction="vertical">
            <a-typography-text type="secondary">Here you can view your receipts, and upload new ones</a-typography-text>
            <a-upload
                v-model:file-list="receiptFileList"
                name="receiptdata"
                :before-upload="beforeUpload"
                @change="handleChange"
            >
                <a-button><upload-outlined/> Upload Receipt </a-button>
            </a-upload>

        </a-space>
        <a-table :columns="columnsReceipt" :data-source="receiptData">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <span>
                        <a @click="viewMedicalCertificate(record)">View Receipt</a>
                    </span>
                </template>
            </template>
        </a-table>
    </a-tab-pane>
  </a-tabs>


    <a-modal v-model:visible="visible" :title="modalType" @ok="handleOk">
        <template v-if="modalType === 'Payroll Details'">
            <p>ID: {{selectedPayroll.payroll_id}}</p>
            <p>Amount Received: {{selectedPayroll.amount}}</p>
            <p>Date submitted: {{selectedPayroll.datetime}}</p>
        </template>
        <template v-else>
            <img :src="sourceFile"/>
        </template>

    </a-modal>
    </div>
</template>

<script setup>
//FUNCTIONAL REQUIREMENT 2: VIEW PERSONAL PAYROLL
//FUNCTIONAL REQUIREMENT 5: Upload Personal Medical Certificate (MC)
//FUNCTIONAL REQUIREMENT 6: Viewing of Personal Medical Certificate
//FUNCTIONAL REQUIREMENT 8: Upload Personal Receipt
//FUNCTIONAL REQUIREMENT 9: View Personal Receipt
//FUNCTIONAL REQUIREMENT 11: Downloading of Personal Payroll


import { message, Upload } from 'ant-design-vue';

    const activeKey = ref("1")
    const payrollData = ref([])
    const mcData = ref([])
    const receiptData = ref([])
    const mcFileList = ref([])
    const receiptFileList = ref([])
    const sourceFile = ref("")
    const visible = ref(false)
    const modalType = ref("Payroll Details")
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

    const columnsMc = ref([
        {
            title: "Name",
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

    const selectedPayroll = ref({})

    //to view payroll, MC, and receipts
    onMounted(async () => {
        //FUNCTIONAL REQUIREMENT 2: VIEW PERSONAL PAYROLL
        const {data: payroll, pending, error, refresh} = await useAsyncData('payroll', () => $fetch('/server-api/view_payroll_all'))
        await refresh()

        if (payroll.value.result == "success") {
            payrollData.value = JSON.parse(payroll.value.message)
        }
        requestMCData()
        requestReceiptData()
    })

    const requestMCData = async () => {
        //FUNCTIONAL REQUIREMENT 6: Viewing of Personal Medical Certificate
        const {data: mc, pending: mcpending, error: mcerror, refresh: refresh2} = await useAsyncData('mc', () => $fetch('/server-api/view_uploads?file_type=0'), {initialCache: false})

        console.log(mc.value)
        if (mc.value.result == "success") {
            mcData.value = JSON.parse(mc.value.message)
        }
    }

    const requestReceiptData = async () => {
        //FUNCTIONAL REQUIREMENT 9: View Personal Receipt
        const {data: receipt, pending: rpending, error: rerror, refresh: refresh3} = await useAsyncData('receipt', () => $fetch('/server-api/view_uploads?file_type=1'), {initialCache: false})

        console.log(receipt.value)
        if (receipt.value.result == "success") {
            receiptData.value = JSON.parse(receipt.value.message)
        }
    }

    const handleOk = (e) => {
      visible.value = false
    }

    const viewPayrollSingle = (record) => {
      visible.value = true
      sourceFile.value = ""
      modalType.value = "Payroll Details"
      selectedPayroll.value = record
    }

    const downloadPayroll = async (record) => { //vanilla HTML time
        var element = document.createElement('a');
        element.setAttribute('href', '/server-api/download_payroll?payroll_id=' + record.payroll_id); //TODO: sanitize later?

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

    }

    //FUNCTIONAL REQUIREMENT 5: Upload Personal Medical Certificate (MC)
    //FUNCTIONAL REQUIREMENT 8: Upload Personal Receipt
    const handleChange = (info) => {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        requestMCData()
        requestReceiptData()
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    }
    const beforeUpload = file => { //TODO: update for PNG JPG JPEG
      const isPNG = file.type === 'image/png';
      if (!isPNG) {
        message.error(`${file.name} is not a png file`);
      }
      return isPNG || Upload.LIST_IGNORE;
    }

    const onFinishMC = (values) => {
        console.log("success valyues " + values)
    }

    const viewMedicalCertificate = (record) => {
        var source = "/server-api/view_uploads_single?file_name=" + record.name
        console.log(source)
        sourceFile.value = source
        visible.value = true
        modalType.value = "MC Details"

    }

</script>