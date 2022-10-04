<template>
    <div>
        <a-typography-title>Manage Employee Accounts</a-typography-title>
        <a-typography-text type="secondary">Here you can disable or enable other accounts</a-typography-text>
        <a-table :columns="columns" :data-source="accountData">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <span>
                        <a @click="enableAccount(record, 1)">Enable</a>
                        <a-divider type="vertical" />
                        <a @click="enableAccount(record, 0)">Disable</a>
                    </span>
                </template>
            </template>
        </a-table>

        <a-modal v-model:visible="visible" title="Account Creation Result" @ok="handleOk">
            <p>{{manageResult}}</p>
        </a-modal>
    </div>
</template>

<script setup>
// FUNCTIONAL REQUIREMENT 16.2: HR will be able to disable accounts to put them in an inactive state.
    const accountData = ref ([])
    const manageResult = ref("")
    const visible = ref(false)

    const columns = ref([
        {
            title: 'Account ID',
            dataIndex: 'account_id',
            key: 'account_id',
        },
        {
            title: 'User Name',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Account Type',
            dataIndex: 'access_type',
            key: 'access_type',
        },
        {
            title: 'Active',
            dataIndex: 'active',
            key: 'active',
        },
        {
            title: 'Actions',
            key: 'action',
        },
    ])
    
    onMounted(async () => {
        getAccountData()
    })

    const getAccountData = async () => {
        const {data: manageAcc, pending, error, refresh} = await useAsyncData('manageAcc', () => $fetch('/server-api/all_accounts'), {initialCache: false})

        if (manageAcc.value.result == "success") {
            accountData.value = JSON.parse(manageAcc.value.message)
        }
        else {
            console.log(manageAcc.value.message)
        }
    }

    const enableAccount = async (record, enable) => {
        if (record.access_type == 2) {
            manageResult.value = "not allowed"
            visible.value = true
        }
        else {
            const {data: enableAccount, pending, error, refresh} = await useAsyncData('manageAcc', () => 
            $fetch('/server-api/set_active', {
                method: 'POST',
                body: {
                    account_id: record.account_id,
                    active: enable
                }
            }), 
            {initialCache: false})

            if (enableAccount.value.result == "success") {
                await getAccountData()
            }
            else {
                manageResult.value = enableAccount.value.message
                visible.value = true
            }

        }
    }

    const handleOk = (e) => {
      visible.value = false
    }
    
    
</script>