<template>
    <a-typography-title>{{employee}}'s Medical Certificates</a-typography-title>
        <a-space direction="vertical">
            <a-typography-text type="secondary">Here you can view employee medical certificates</a-typography-text>
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

        <a-modal v-model:visible="visible" title="MC Details" @ok="handleOk">
            <img :src="sourceFile"/>
        </a-modal>
</template>

<script setup>
    const mcData = ref([])
    const sourceFile = ref("")
    const visible = ref(false)
    const employee = ref("Employee")

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

    const props = defineProps(["user"])

    watch(() => props.user, (newValue, oldValue) => {
        console.log("updating MC")
        requestMCData(newValue.account_id)
        employee.value = newValue.username
    })

    const requestMCData = async (userid) => {
        //FUNCTIONAL REQUIREMENT 6: Viewing of Personal Medical Certificate
        const {data: mc, pending: mcpending, error: mcerror, refresh: refresh2} = await useAsyncData('mc', () => $fetch('/server-api/view_uploads?file_type=0&other_user=' + userid), {initialCache: false})

        console.log(mc.value)
        if (mc.value.result == "success") {
            mcData.value = JSON.parse(mc.value.message)
        }
    }

    const viewMedicalCertificate = (record) => {
        var source = "/server-api/view_uploads_single?other_user=yes&file_name=" + record.name
        console.log(source)
        sourceFile.value = source
        visible.value = true
    }

    const handleOk = (e) => {
      visible.value = false
    }
</script>