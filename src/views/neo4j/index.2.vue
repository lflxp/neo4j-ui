<template>
    <el-container>
      <el-header>
        <el-row :gutter="12">
          <el-col :span="8">
            <el-card shadow="always">
              总是显示
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover">
              鼠标悬浮时显示
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="never">
              从不显示
            </el-card>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <div class="flowChart" id="flowChart"></div>
        <el-row :gutter="12">
          <el-col :span="8">
            <el-card shadow="always">
              总是显示
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover">
              鼠标悬浮时显示
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="never">
              从不显示
            </el-card>
          </el-col>
        </el-row>
      </el-main>
      <el-footer>
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>卡片名称</span>
            <el-button style="float: right; padding: 3px 0" type="text">操作按钮</el-button>
          </div>
          <div v-for="o in 4" :key="o" class="text item">
            {{'列表内容 ' + o }}
          </div>
        </el-card>
      </el-footer>
    </el-container>
</template>
<script>
import Http from '@/utils/service'


</script>

<style>
  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .box-card {
    width: 480px;
  }
</style>