"""add title name and requirement

Revision ID: a1b2c3d4e5f6
Revises: 8c028915768b
Create Date: 2026-05-27 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'a1b2c3d4e5f6'
down_revision = '8c028915768b'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('titles') as batch_op:
        batch_op.add_column(sa.Column('name', sa.String(length=64), nullable=False, server_default=''))
        batch_op.add_column(sa.Column('requirement', sa.Integer(), nullable=False, server_default='0'))
        batch_op.create_unique_constraint('uq_titles_name', ['name'])


def downgrade():
    with op.batch_alter_table('titles') as batch_op:
        batch_op.drop_constraint('uq_titles_name', type_='unique')
        batch_op.drop_column('requirement')
        batch_op.drop_column('name')
