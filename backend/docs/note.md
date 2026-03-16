```mermaid
usecaseDiagram
    actor 顾客
    actor 前台服务员
    actor 客房部经理
    actor 信用卡系统

    rect rgb(240,248,255)
    usecase UC1 as "在线预订房间"
    usecase UC2 as "前台预订房间"
    usecase UC3 as "支付订金"
    usecase UC4 as "现金支付订金"
    usecase UC5 as "信用卡支付订金"
    usecase UC6 as "查看预订情况"
    usecase UC7 as "查看每日收款情况"
    end

    %% 参与者与用例关联
    顾客 --> UC1
    顾客 --> UC2
    前台服务员 --> UC2
    客房部经理 --> UC6
    客房部经理 --> UC7

    %% 包含关系：预订必须支付订金
    UC1 --> UC3
    UC2 --> UC3

    %% 扩展关系：支付订金可扩展为现金或信用卡支付
    UC4 <|--|> UC3 : extends
    UC5 <|--|> UC3 : extends

    %% 信用卡支付需要与外部系统通信
    UC5 --> 信用卡系统 : 通信
```