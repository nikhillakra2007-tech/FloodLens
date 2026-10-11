"""phase2_expansion

Revision ID: 1a2b3c4d5e6f
Revises: eaa799ae9ef1
Create Date: 2026-10-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2
from sqlalchemy.dialects import postgresql

revision: str = '1a2b3c4d5e6f'
down_revision: Union[str, None] = 'eaa799ae9ef1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enhanced flood events with more detail
    op.create_table('flood_events_v2',
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('rainfall_mm', sa.Float(), nullable=True),
        sa.Column('source', sa.String(length=300), nullable=False),
        sa.Column('event_name', sa.String(length=300), nullable=True),
        sa.Column('geographic_extent', sa.String(length=500), nullable=True),
        sa.Column('affected_wards', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('damage_estimate_inr', sa.Float(), nullable=True),
        sa.Column('data_quality', sa.String(length=50), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint("event_type IN ('monsoon', 'cyclone', 'extreme_rainfall', 'localised_rain', 'unknown')", name='ck_flood_events_v2_type'),
        sa.CheckConstraint('rainfall_mm IS NULL OR rainfall_mm >= 0', name='ck_flood_events_v2_rainfall'),
        sa.CheckConstraint('started_at IS NULL OR ended_at IS NULL OR ended_at >= started_at', name='ck_flood_events_v2_timestamps'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_flood_events_v2_started_at'), 'flood_events_v2', ['started_at'], unique=False)

    # 2. Dataset versions for temporal tracking
    op.create_table('dataset_versions',
        sa.Column('source_id', sa.UUID(), nullable=False),
        sa.Column('version', sa.String(length=100), nullable=False),
        sa.Column('valid_from', sa.DateTime(timezone=True), nullable=True),
        sa.Column('valid_to', sa.DateTime(timezone=True), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('file_count', sa.Integer(), nullable=True),
        sa.Column('record_count', sa.Integer(), nullable=True),
        sa.Column('geometry_type', sa.String(length=50), nullable=True),
        sa.Column('coverage_bbox', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ingestion_run_id', sa.UUID(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, default='active'),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint("status IN ('active', 'superseded', 'deprecated')", name='ck_dataset_versions_status'),
        sa.ForeignKeyConstraint(['source_id'], ['data_sources.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('source_id', 'version', name='uq_dataset_versions_source_version')
    )
    op.create_index(op.f('ix_dataset_versions_source_id'), 'dataset_versions', ['source_id'], unique=False)

    # 3. Feature derivations for full lineage
    op.create_table('feature_derivations',
        sa.Column('feature_type', sa.String(length=100), nullable=False),
        sa.Column('place_id', sa.UUID(), nullable=True),
        sa.Column('event_id', sa.UUID(), nullable=True),
        sa.Column('input_source_file_ids', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('computation_method', sa.String(length=200), nullable=False),
        sa.Column('computation_version', sa.String(length=50), nullable=False),
        sa.Column('parameters', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('output_feature_name', sa.String(length=100), nullable=False),
        sa.Column('output_value', sa.Float(), nullable=True),
        sa.Column('output_unit', sa.String(length=50), nullable=True),
        sa.Column('spatial_extent', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('temporal_extent', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('uncertainty', sa.Float(), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['event_id'], ['flood_events.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['place_id'], ['places.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_feature_derivations_place_id'), 'feature_derivations', ['place_id'], unique=False)
    op.create_index(op.f('ix_feature_derivations_event_id'), 'feature_derivations', ['event_id'], unique=False)

    # 4. Event-level rainfall features
    op.create_table('rainfall_event_features',
        sa.Column('event_id', sa.UUID(), nullable=False),
        sa.Column('place_id', sa.UUID(), nullable=True),
        sa.Column('station_id', sa.String(length=100), nullable=True),
        sa.Column('source', sa.String(length=300), nullable=False),
        sa.Column('spatial_method', sa.String(length=100), nullable=True),
        sa.Column('rainfall_window_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('rainfall_window_end', sa.DateTime(timezone=True), nullable=False),
        sa.Column('cumulative_rainfall_mm', sa.Float(), nullable=True),
        sa.Column('peak_interval_rainfall_mm', sa.Float(), nullable=True),
        sa.Column('peak_interval_hours', sa.Float(), nullable=True),
        sa.Column('mean_intensity_mm_per_hr', sa.Float(), nullable=True),
        sa.Column('max_intensity_mm_per_hr', sa.Float(), nullable=True),
        sa.Column('duration_hours', sa.Float(), nullable=True),
        sa.Column('antecedent_rainfall_24h_mm', sa.Float(), nullable=True),
        sa.Column('antecedent_rainfall_72h_mm', sa.Float(), nullable=True),
        sa.Column('station_distance_m', sa.Float(), nullable=True),
        sa.Column('interpolation_uncertainty', sa.Float(), nullable=True),
        sa.Column('confidence_level', sa.String(length=20), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint("confidence_level IN ('HIGH', 'MODERATE', 'LOW', 'UNKNOWN')", name='ck_rainfall_event_features_confidence'),
        sa.ForeignKeyConstraint(['event_id'], ['flood_events.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['place_id'], ['places.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_rainfall_event_features_event_id'), 'rainfall_event_features', ['event_id'], unique=False)
    op.create_index(op.f('ix_rainfall_event_features_place_id'), 'rainfall_event_features', ['place_id'], unique=False)

    # 5. Contributing area proxies
    op.create_table('contributing_area_proxies',
        sa.Column('place_id', sa.UUID(), nullable=False),
        sa.Column('method', sa.String(length=100), nullable=False),
        sa.Column('method_version', sa.String(length=50), nullable=False),
        sa.Column('analysis_radius_m', sa.Float(), nullable=True),
        sa.Column('area_km2', sa.Float(), nullable=True),
        sa.Column('drainage_path_length_m', sa.Float(), nullable=True),
        sa.Column('outfall_count', sa.Integer(), nullable=True),
        sa.Column('upstream_drain_length_m', sa.Float(), nullable=True),
        sa.Column('upstream_builtup_fraction', sa.Float(), nullable=True),
        sa.Column('upstream_impervious_proxy', sa.Float(), nullable=True),
        sa.Column('flow_direction_proxy', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('depression_volume_m3', sa.Float(), nullable=True),
        sa.Column('uncertainty', sa.Float(), nullable=True),
        sa.Column('is_true_catchment', sa.Boolean(), nullable=False, default=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['place_id'], ['places.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('place_id', 'method', 'method_version', name='uq_contributing_area_proxies_place_method_version')
    )
    op.create_index(op.f('ix_contributing_area_proxies_place_id'), 'contributing_area_proxies', ['place_id'], unique=False)

    # 6. Drainage network versions
    op.create_table('drainage_network_versions',
        sa.Column('version', sa.String(length=100), nullable=False),
        sa.Column('survey_year', sa.Integer(), nullable=True),
        sa.Column('survey_source', sa.String(length=300), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('segment_count', sa.Integer(), nullable=True),
        sa.Column('node_count', sa.Integer(), nullable=True),
        sa.Column('outfall_count', sa.Integer(), nullable=True),
        sa.Column('total_length_m', sa.Float(), nullable=True),
        sa.Column('wards_covered', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('geometry_provenance', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_event_aligned', sa.Boolean(), nullable=False, default=False),
        sa.Column('aligned_event_id', sa.UUID(), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['aligned_event_id'], ['flood_events.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('version', name='uq_drainage_network_versions_version')
    )

    # 7. Comparison explanations (explainable similarity)
    op.create_table('comparison_explanations',
        sa.Column('comparison_id', sa.UUID(), nullable=False),
        sa.Column('feature_name', sa.String(length=100), nullable=False),
        sa.Column('feature_category', sa.String(length=50), nullable=False),
        sa.Column('value_a', sa.Float(), nullable=True),
        sa.Column('value_b', sa.Float(), nullable=True),
        sa.Column('similarity_score', sa.Float(), nullable=False),
        sa.Column('weight', sa.Float(), nullable=False),
        sa.Column('weighted_contribution', sa.Float(), nullable=False),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('data_quality', sa.String(length=20), nullable=True),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint('similarity_score >= 0 AND similarity_score <= 1', name='ck_comparison_explanations_similarity'),
        sa.CheckConstraint('weighted_contribution >= 0 AND weighted_contribution <= 1', name='ck_comparison_explanations_weighted'),
        sa.ForeignKeyConstraint(['comparison_id'], ['comparisons.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_comparison_explanations_comparison_id'), 'comparison_explanations', ['comparison_id'], unique=False)

    # 8. Validation runs for historical validation
    op.create_table('validation_runs',
        sa.Column('investigation_id', sa.UUID(), nullable=False),
        sa.Column('proposed_mechanism', sa.String(length=50), nullable=True),
        sa.Column('event_count', sa.Integer(), nullable=False, default=0),
        sa.Column('supporting_event_count', sa.Integer(), nullable=False, default=0),
        sa.Column('contradicting_event_count', sa.Integer(), nullable=False, default=0),
        sa.Column('inconclusive_event_count', sa.Integer(), nullable=False, default=0),
        sa.Column('result', sa.String(length=50), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('recurring_mechanisms', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('method_version', sa.String(length=50), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint("result IN ('STRONG_SUPPORT', 'MODERATE_SUPPORT', 'WEAK_SUPPORT', 'MIXED', 'INSUFFICIENT_DATA')", name='ck_validation_runs_result'),
        sa.ForeignKeyConstraint(['investigation_id'], ['investigations.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_validation_runs_investigation_id'), 'validation_runs', ['investigation_id'], unique=False)

    # 9. Geometry provenance for drainage
    op.add_column('drain_segments', sa.Column('geometry_provenance', sa.String(length=50), nullable=True))
    op.add_column('drain_nodes', sa.Column('geometry_provenance', sa.String(length=50), nullable=True))
    op.add_column('outfalls', sa.Column('geometry_provenance', sa.String(length=50), nullable=True))

    # 10. Event alignment for drainage
    op.add_column('drain_segments', sa.Column('network_version_id', sa.UUID(), nullable=True))
    op.add_column('drain_nodes', sa.Column('network_version_id', sa.UUID(), nullable=True))
    op.add_column('outfalls', sa.Column('network_version_id', sa.UUID(), nullable=True))

    op.create_foreign_key('fk_drain_segments_network_version', 'drain_segments', 'drainage_network_versions', ['network_version_id'], ['id'])
    op.create_foreign_key('fk_drain_nodes_network_version', 'drain_nodes', 'drainage_network_versions', ['network_version_id'], ['id'])
    op.create_foreign_key('fk_outfalls_network_version', 'outfalls', 'drainage_network_versions', ['network_version_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('fk_outfalls_network_version', 'outfalls', type_='foreignkey')
    op.drop_constraint('fk_drain_nodes_network_version', 'drain_nodes', type_='foreignkey')
    op.drop_constraint('fk_drain_segments_network_version', 'drain_segments', type_='foreignkey')
    op.drop_column('outfalls', 'network_version_id')
    op.drop_column('drain_nodes', 'network_version_id')
    op.drop_column('drain_segments', 'network_version_id')
    op.drop_column('outfalls', 'geometry_provenance')
    op.drop_column('drain_nodes', 'geometry_provenance')
    op.drop_column('drain_segments', 'geometry_provenance')
    op.drop_table('validation_runs')
    op.drop_table('comparison_explanations')
    op.drop_table('drainage_network_versions')
    op.drop_table('contributing_area_proxies')
    op.drop_table('rainfall_event_features')
    op.drop_table('feature_derivations')
    op.drop_table('dataset_versions')
    op.drop_table('flood_events_v2')