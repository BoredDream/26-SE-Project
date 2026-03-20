// API基础URL
const API_BASE_URL = '/v1';

// 当前用户信息
let currentUser = null;

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 初始化登录表单事件
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', handleLogin);
    
    // 初始化侧边栏导航事件
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // 更新活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 初始化退出登录事件
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', handleLogout);
    
    // 初始化刷新按钮事件
    const refreshBtn = document.getElementById('refresh-checkins');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadPendingCheckins);
    }
    
    // 初始化模态框事件
    const confirmRejectBtn = document.getElementById('confirm-reject');
    confirmRejectBtn.addEventListener('click', handleRejectCheckin);
    
    // 检查本地存储中是否有登录信息
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showAdminPanel();
            showSection('dashboard');
        } catch (e) {
            localStorage.removeItem('adminUser');
        }
    }
});

// 处理登录
async function handleLogin(e) {
    e.preventDefault();
    
    const openid = document.getElementById('openid').value;
    
    try {
        // 模拟登录，实际项目中应该调用微信登录API
        // 这里使用固定的管理员openid进行演示
        if (openid === 'admin_openid') {
            currentUser = {
                id: 1,
                openid: openid,
                nickname: '管理员',
                isAdmin: true,
                createdAt: new Date().toISOString()
            };
            
            // 保存到本地存储
            localStorage.setItem('adminUser', JSON.stringify(currentUser));
            
            // 显示管理员面板
            showAdminPanel();
            showSection('dashboard');
        } else {
            alert('无效的管理员OpenID');
        }
    } catch (error) {
        console.error('登录失败:', error);
        alert('登录失败，请重试');
    }
}

// 显示管理员面板
function showAdminPanel() {
    document.getElementById('login-container').classList.add('d-none');
    document.getElementById('admin-container').classList.remove('d-none');
    document.getElementById('current-user').textContent = currentUser.nickname;
    
    // 加载数据
    loadDashboardData();
    loadPendingCheckins();
    loadUsers();
}

// 处理退出登录
function handleLogout(e) {
    e.preventDefault();
    
    localStorage.removeItem('adminUser');
    currentUser = null;
    
    // 显示登录页面
    document.getElementById('admin-container').classList.add('d-none');
    document.getElementById('login-container').classList.remove('d-none');
}

// 显示指定部分
function showSection(section) {
    // 隐藏所有部分
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => s.classList.add('d-none'));
    
    // 显示指定部分
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.classList.remove('d-none');
        
        // 根据部分加载相应数据
        if (section === 'dashboard') {
            loadDashboardData();
        } else if (section === 'checkins') {
            loadPendingCheckins();
        } else if (section === 'users') {
            loadUsers();
        }
    }
}

// 加载仪表盘数据
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/statistics`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token || 'admin'}`
            }
        });
        
        if (!response.ok) {
            throw new Error('加载数据失败');
        }
        
        const data = await response.json();
        
        // 更新统计数据
        document.getElementById('total-users').textContent = data.data.totalUsers;
        document.getElementById('total-locations').textContent = data.data.totalLocations;
        document.getElementById('pending-checkins').textContent = data.data.pendingCheckins;
        document.getElementById('total-checkins').textContent = data.data.totalCheckins;
    } catch (error) {
        console.error('加载仪表盘数据失败:', error);
        // 使用模拟数据
        document.getElementById('total-users').textContent = 123;
        document.getElementById('total-locations').textContent = 45;
        document.getElementById('pending-checkins').textContent = 6;
        document.getElementById('total-checkins').textContent = 789;
    }
}

// 加载待审核打卡
async function loadPendingCheckins() {
    const tableBody = document.getElementById('checkins-table-body');
    tableBody.innerHTML = '<tr><td colspan="7" class="loading"><i class="fas fa-spinner fa-spin"></i> 加载中...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/checkins/pending`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token || 'admin'}`
            }
        });
        
        if (!response.ok) {
            throw new Error('加载数据失败');
        }
        
        const data = await response.json();
        const checkins = data.data || [];
        
        // 渲染表格
        if (checkins.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">没有待审核的打卡记录</td></tr>';
            return;
        }
        
        tableBody.innerHTML = checkins.map(checkin => `
            <tr>
                <td>${checkin.id}</td>
                <td>${checkin.user ? checkin.user.nickname || '未知用户' : '未知用户'}</td>
                <td>${checkin.location ? checkin.location.name || '未知地点' : '未知地点'}</td>
                <td>${getStatusText(checkin.bloomReport)}</td>
                <td>${checkin.content || '-'}</td>
                <td>${formatDate(checkin.createdAt)}</td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="approveCheckin(${checkin.id})"><i class="fas fa-check"></i> 批准</button>
                    <button class="btn btn-danger btn-sm" onclick="showRejectModal(${checkin.id})"><i class="fas fa-times"></i> 拒绝</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('加载待审核打卡失败:', error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">加载失败，请重试</td></tr>';
    }
}

// 加载用户列表
async function loadUsers() {
    const tableBody = document.getElementById('users-table-body');
    tableBody.innerHTML = '<tr><td colspan="6" class="loading"><i class="fas fa-spinner fa-spin"></i> 加载中...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token || 'admin'}`
            }
        });
        
        if (!response.ok) {
            throw new Error('加载数据失败');
        }
        
        const data = await response.json();
        const users = data.data || [];
        
        // 渲染表格
        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.openid}</td>
                <td>${user.nickname || '未设置'}</td>
                <td>
                    <select class="form-select form-select-sm" onchange="updateUserRole(${user.id}, this.value)">
                        <option value="false" ${!user.isAdmin ? 'selected' : ''}>普通用户</option>
                        <option value="true" ${user.isAdmin ? 'selected' : ''}>管理员</option>
                    </select>
                </td>
                <td>${formatDate(user.createdAt)}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="viewUserDetails(${user.id})"><i class="fas fa-eye"></i> 详情</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('加载用户列表失败:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">加载失败，请重试</td></tr>';
    }
}

// 批准打卡
async function approveCheckin(checkinId) {
    if (!confirm('确定要批准这条打卡记录吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/checkins/${checkinId}/audit?action=approve`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${currentUser.token || 'admin'}`
            }
        });
        
        if (!response.ok) {
            throw new Error('操作失败');
        }
        
        alert('批准成功');
        loadPendingCheckins();
    } catch (error) {
        console.error('批准打卡失败:', error);
        alert('操作失败，请重试');
    }
}

// 显示拒绝模态框
let currentRejectCheckinId = null;
function showRejectModal(checkinId) {
    currentRejectCheckinId = checkinId;
    document.getElementById('reject-reason').value = '';
    const modal = new bootstrap.Modal(document.getElementById('reject-modal'));
    modal.show();
}

// 处理拒绝打卡
async function handleRejectCheckin() {
    const reason = document.getElementById('reject-reason').value.trim();
    if (!reason) {
        alert('请输入拒绝理由');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/checkins/${currentRejectCheckinId}/audit?action=reject&reason=${encodeURIComponent(reason)}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${currentUser.token || 'admin'}`
            }
        });
        
        if (!response.ok) {
            throw new Error('操作失败');
        }
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('reject-modal'));
        modal.hide();
        
        alert('拒绝成功');
        loadPendingCheckins();
    } catch (error) {
        console.error('拒绝打卡失败:', error);
        alert('操作失败，请重试');
    }
}

// 更新用户角色
async function updateUserRole(userId, isAdmin) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role?is_admin=${isAdmin}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${currentUser.token || 'admin'}`
            }
        });
        
        if (!response.ok) {
            throw new Error('操作失败');
        }
        
        alert('角色更新成功');
    } catch (error) {
        console.error('更新用户角色失败:', error);
        alert('操作失败，请重试');
        // 恢复之前的选择
        loadUsers();
    }
}

// 查看用户详情
function viewUserDetails(userId) {
    alert(`查看用户 ${userId} 的详情功能正在开发中...`);
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'dormant': '休眠期',
        'budding': '含苞待放',
        'blooming': '盛开',
        'withering': '凋谢'
    };
    return statusMap[status] || status || '未报告';
}