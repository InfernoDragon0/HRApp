<template>
    <a-typography-title>Employee's Payrolls</a-typography-title>
        <a-typography-text type="secondary">Here you can view payrolls, edit, download them</a-typography-text>
        <a-table :columns="columns" :data-source="payrollData">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <span>
                        <a @click="viewPayrollSingle(record)">View</a>
                        <a-divider type="vertical" />
                        <a @click="downloadPayroll(record)">Download</a>
                        <a-divider type="vertical" />
                        <a @click="downloadPayroll(record)">Edit</a>
                    </span>
                </template>
            </template>
        </a-table>
</template>

<script setup>

</script>