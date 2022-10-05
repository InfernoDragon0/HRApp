<template>
    <div>
        <a-typography-title>Manage Resumes</a-typography-title>
        <a-typography-text type="secondary">Here you can upload, and download resumes</a-typography-text>
        <a-upload
            name="file_data"
            accept=".pdf"
            action="/server-api/upload/2"
            @change="handleChange"
            showUploadList=false  
        >
            <a-button><upload-outlined/> Upload Resume </a-button>
        </a-upload>
        <a-table :columns="columns" :data-source="resumeData">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <span>
                        <a @click="downloadButton(record)">Download to View</a>
                    </span>
                </template>
            </template>
        </a-table>
    </div>
</template>

<script setup>
// FUNCTIONAL REQUIREMENT 14: Uploading of Job Applicant’s Resume
//  FUNCTIONAL REQUIREMENT 13: Viewing of Job Applicant’s resume
//  FUNCTIONAL REQUIREMENT 15: Downloading of Job Applicant’s Resume

    const resumeData = ref ([])
    const visible = ref(false)

    const columns = ref([
        {
            title: 'Resume',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Actions',
            key: 'action',
        },
    ])
    
    onMounted(async () => {
        getResumeData()
    })

    const getResumeData = async () => {
        const {data: resumes, pending, error, refresh} = await useAsyncData('resumes', () => $fetch('/server-api/view_uploads?file_type=2'), {initialCache: false})
        console.log(resumes.value)
        if (resumes.value.result == "success") {
            resumeData.value = JSON.parse(resumes.value.message)
        }
        else {
            console.log(resumes.value.message)
        }
    }

    const downloadButton = async (record) => {
        var source = "/server-api/view_uploads_single?other_user=yes&file_name=" + record.name

        var element = document.createElement('a');
        element.setAttribute('href', source);
        element.setAttribute('target', "_blank");

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
 

    const handleOk = (e) => {
      visible.value = false
    }

    const handleChange = (info) => {
      if (info.file.status !== 'uploading') {
      }
      if (info.file.status === 'done') {
        getResumeData()
      } else if (info.file.status === 'error') {
      }
    }
    
</script>